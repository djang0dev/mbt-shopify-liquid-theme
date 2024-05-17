import { Page, expect } from "@playwright/test"
import { StateMachine, type StateValueFrom } from "xstate"
import {
  PlaywrightFunctionEvent,
  PlaywrightState,
  StateAndEvents,
} from "../../types/playwright.types"
import { FlattenStates } from "../../types/xstate.types"

// Commons
export const isFunction = (el: unknown): el is (...args: any) => any => {
  return typeof el === "function"
}

export const getOrThrow = <T = string>(value: T | undefined) => {
  if (value === undefined) throw new Error("Value not defined")
  return value
}

export const generateXstateTestStateFromPwStates = (
  playwrightState: PlaywrightState,
  page: Page,
) => {
  if (isFunction(playwrightState)) {
    return async () => {
      await playwrightState()
    }
  }
  const meta = playwrightState.meta
  return async () => {
    if (playwrightState?.decoratedHandler) {
      await playwrightState.decoratedHandler()
    }
    if (meta?.waitFor && meta.urlRegex) {
      await page.waitForURL(meta.urlRegex)
    }
    if (meta?.expectUrl) {
      expect(page.url()).toMatch(meta.urlRegex)
    }
  }
}

export const generateXstateStateAndEventsFromPw = (
  playwrightStatesAndEvents: StateAndEvents,
  page: Page,
) => {
  const states = {}
  const events = {}

  Object.keys(playwrightStatesAndEvents.states).forEach((key) => {
    const playwrightState = Reflect.get(playwrightStatesAndEvents.states, key)
    Reflect.set(states, key, generateXstateTestStateFromPwStates(playwrightState, page))
  })

  Object.keys(playwrightStatesAndEvents.events).forEach((key) => {
    const playwrightEvent = Reflect.get(playwrightStatesAndEvents.events, key)
    Reflect.set(events, key, playwrightEvent)
  })
  return {
    states,
    events,
  }
}

export const genPwMetas = <
  TMachine extends StateMachine<any, any, any, any, any, any, any, any, any, any, any>,
>(
  self: (page: Page) => {
    states: Partial<Record<FlattenStates<StateValueFrom<TMachine>>, PlaywrightState>>
    events: Partial<Record<Exclude<TMachine["events"][0], "*">, PlaywrightFunctionEvent>>
  },
) => self
