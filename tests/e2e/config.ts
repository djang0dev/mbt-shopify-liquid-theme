import * as process from "node:process"
import type { Page } from "@playwright/test"
import dotenv from "dotenv"
import { getOrThrow } from "./utils"

dotenv.config()

export const e2eConfig = {
  localBaseShopUrl: process.env.LOCAL_SHOP_HOST
    ? `http://${process.env.LOCAL_SHOP_HOST}`
    : "http://localhost:9292",
  webBaseShopUrl: `https://${getOrThrow(process.env.SHOPIFY_FLAG_STORE)}`,
  isPlaywrightHeadless: !(process.env.PLAYWRIGHT_HEADFULL === "true"),
  themeId: getOrThrow(process.env.SHOPIFY_DEV_THEME_ID),
  storePassword: process.env.SHOPIFY_STORE_PASSWORD,
  isStorePasswordLocked: new Set([undefined, "true"]).has(process.env.IS_STORE_PASSWORD_LOCKED),
} as const

export const playwrightShopifyPasswordChecker = async (
  page: Page,
  url: string,
  password: string,
) => {
  const passwordInput = await page.$('input[type="password"]')
  if (passwordInput) {
    await passwordInput.fill(password)
    const submitButton = await page.$('button[type="submit"]')
    if (submitButton) {
      await submitButton.click()
    }
    await page.waitForURL(url)
  }
}
