import { test } from "@playwright/test"
import { createTestMachine, createTestModel } from "@xstate/test"
import { e2eConfig } from "./config"

const machine = createTestMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCGsCWBjAEgewFswAFVGAOgwDsMAXDVAG3LyvyNIrCtoCcBPAA55qtAMQ4AogCUA8gH0A4goAqCgMo5ZxeQEEAMvoDaABgC6iUMMz1WlkAA9EAZgBMADnLuPARhOufAE4fdxN3AHYAFgAaEH4XQMDycPCgsOcANhMAVjcMgF982LRMXEISMjBKGnomavUACzxBXUZGTiruPiERHglJXQARGXkAWUkAOQBVJVUFLXH5Yl1FSVMLJBBrOgw7TacEZ2yfch9XSMTnd3ds10DXbNj4hEDnE9dU9wz7jNyTDJ8hSKICoeAgcHsJWw7AqMHs21sVHsBwAtK5XE9EOEMslwq4TASTIFIj4Mt4CsCoWUOJVqjsmPC8DZdkj9ohXBlMQhSZFyB98f4TOFMt9roViuhoeUOnTasxWDCOozmXtQAcolyHicUgLIjk3qljuKQFTFbTqPT5WxpbSugJhKJlTtVY5EKTnOREol3CTsgTnK8MXFEHqTHzUvdsuFEscIsbTTaKBa5SxrTSKODYPQqKhEU682zueiuc4A+GghkPBk3Oc45TJdTYVVkwxmNRGs1Wu1KvmWcisTFgwhwt5cSEASECZXIvGG2akzVW-Umi02jK7T1HZsEX3C2dXOQLl6rjc7lqua93p9vhy-gDZ6V583F3V2yuuzLM9nc7urEznayapusWQ4RGGHxpNWdwmGczhAvkQA */
  id: "basicHomePage",
  initial: "onHomePage",
  states: {
    onHomePage: {
      on: {
        HERO_GO_TO_SHOP_ALL: {
          target: "#basicHomePage.inShopAllPage",
          reenter: false,
        },
      },
    },
    inShopAllPage: {
      on: {
        HEADER_MENU_GO_TO_HOME_PAGE: {
          target: "#basicHomePage.inHomePageDestination",
          reenter: false,
        },
      },
    },
    inHomePageDestination: {
      type: "final",
    },
  },
})

createTestModel(machine)
  .getSimplePaths()
  .forEach((path) => {
    test(path.description, async ({ page }) => {
      await path.test({
        states: {
          onHomePage: async () => {
            await page.goto(`${e2eConfig.localBaseShopUrl}/`)
          },
          inHomePageDestination: async () => {
            await page.waitForURL(`${e2eConfig.localBaseShopUrl}/`)
          },
          inShopAllPage: async () => {
            await page.waitForURL(`${e2eConfig.localBaseShopUrl}/collections/all`)
          },
          inShopAllPageDestination: async () => {
            await page.waitForURL(`${e2eConfig.localBaseShopUrl}/`)
          },
        },
        events: {
          HERO_GO_TO_SHOP_ALL: async () => {
            const heroButton = await page.$(".banner a")
            if (!heroButton) throw new Error("Hero button not found")
            await heroButton.click()
          },
          HEADER_MENU_GO_TO_HOME_PAGE: async () => {
            const homeButton = await page.$("#HeaderMenu-home")
            if (!homeButton) throw new Error("Home button not found")
            await homeButton.click()
          },
        },
      })
    })
  })
