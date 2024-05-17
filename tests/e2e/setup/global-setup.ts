import { writeFile } from "node:fs/promises"
import { chromium } from "@playwright/test"
import type { FullConfig } from "@playwright/test"
import merge from "deepmerge"
import { e2eConfig, playwrightShopifyPasswordChecker } from "../config"

async function globalSetup(_config: FullConfig): Promise<void> {
  if (!e2eConfig.storePassword) {
    console.info("Store's password not provided, store is considered unlocked")
    return
  }
  const browser = await chromium.launch({ headless: e2eConfig.isPlaywrightHeadless })

  // There is some 3P / liquid that redirects to the .myshopify.com checkout, so we need to retrieve access from
  const pageWeb = await browser.newPage()
  await pageWeb.goto(`${e2eConfig.webBaseShopUrl}?preview_theme_id=${e2eConfig.themeId}`)
  await playwrightShopifyPasswordChecker(pageWeb, e2eConfig.webBaseShopUrl, e2eConfig.storePassword)
  const webStorageState = await pageWeb.context().storageState()
  await pageWeb.close()

  const page = await browser.newPage()
  await page.goto(e2eConfig.localBaseShopUrl)
  await playwrightShopifyPasswordChecker(
    page,
    `${e2eConfig.localBaseShopUrl}?_fd=0&pb=0`,
    e2eConfig.storePassword,
  )
  const localStorageState = await page.context().storageState()

  await writeFile(
    "./tests/e2e/storage-state/storageState.json",
    JSON.stringify(merge(webStorageState, localStorageState)),
  )
  await browser.close()
}

export default globalSetup
