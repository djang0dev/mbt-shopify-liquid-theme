export type PlaywrightStateMeta = {
  urlRegex: RegExp
  waitFor: boolean
  expectUrl: boolean
}

export type PlaywrightFunctionState = () => Promise<void>

export type PlaywrightObjectState = {
  decoratedHandler?: () => Promise<void>
  meta?: PlaywrightStateMeta
}

export type PlaywrightState = PlaywrightFunctionState | PlaywrightObjectState

export type PlaywrightFunctionEvent = () => Promise<void>
export type StateAndEvents = {
  states: Record<string, PlaywrightState>
  events: Record<string, PlaywrightFunctionEvent>
}
