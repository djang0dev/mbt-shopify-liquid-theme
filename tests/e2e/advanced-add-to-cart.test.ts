import { expect, test } from "@playwright/test"
import { createTestModel } from "@xstate/test"
import { setup } from "xstate"
import { e2eConfig } from "./config"
import { genPwMetas, generateXstateStateAndEventsFromPw } from "./utils"

const singleProductPageBaseUrl = `${e2eConfig.localBaseShopUrl}/products/the-3p-fulfilled-snowboard`

const advancedAddToCartMachine = setup({
  types: {
    events: {} as
      | {
          type: "ADD_TO_CART"
        }
      | {
          type: "BUY_NOW"
        }
      | {
          type: "SHOW_CART"
        }
      | {
          type: "CLICK_ON_VIEW_CART_PAGE_BUTTON"
        }
      | {
          type: "CLICK_ON_HIDE_CART"
        }
      | {
          type: "CLICK_ON_CART_ICON"
        }
      | {
          type: "CHECK_PRODUCT_ADDED_TO_CART"
        }
      | {
          type: "GO_TO_CHECKOUT"
        },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAuBjAss9ALAlgHZgB0A9oQAoBOZEAruqpcjAMQCCAIlwPoAqAeV4BhDgCV+AbQAMAXUSgADmVj5U+CopAAPRACYZADhIBGAKwA2feaMB2c6f0WAnABYANCACeiI6ZJzGWDTCzdDF3cAXyivNCwcAmJyKloGJhZ2ACEAVQBNXgA5QQB1WQUkEBU1DS1KvQRzfS9fBCMjFxIjAGZeywd+t0sXIxi4jGw8IlJ0ZGpULmpkAHcwajYRAAkAUREAaV5KcUEuHJF+Xm4ubb4hUQlpeW1q9U1CbQbbGRJguz-9bqmNzdFz6Tw+RB2YY-HrdNwuKymSxueFjEDxSZJGZzBZLVbUEgECAQMCEDYAGQAkvteIJCvdJLxqXTys9VK86qBPkZvr9-oDgaDwa1LN07F1et1LJYZFDrDJ9GiMYlpiRZvNFis1iQAG74NQAIwANmANjsaUcTmcLlcbgJhGJJKzKi9au96ogvj9ZfygSCwS1IaYTLZeuYEX87PojOYlRMVcl1bitQS9YaTRTqQc6bxNpTrgzHhVlOy3R8DE4SO5zIDrKF9A3hYhReLYVKZXLDLHYuj41NEzjNfjdfr8MbTSIqTScwA1SnbEqFw4cADi214uX4QkKzpLNTe5caPO9kYBfqFgcapnFxl6dlMxiG1m6cYS-dISjSjFQHGJkH4ZAiDibArsIdxbLseyCDkRZsvunK6M2zQQggoTWCQkrdOYDiON0RiWDEPaEHQcDaMq75wRy7pcogAC0liXrR5hVpErFsaxwKvpiqoUDQdDfpkYCUWWHoIOEl6mC4lgYZKbgWFKdh4aYXEJtiGp4mswkHqJ5hNo0QQyZKFiGJYumKj25FYmqg4aQSRIktRVSltpNFiW43wIt0MgjNhbiKdYl6iiYmHSrK0pdip77WepKYjumQkus5CENA+yGtHY8IkG4oaithNiRG4kVWZ+-FML+JIQABQHzFpyWIC43lZTK7R2LKNbwpeUL6IZUr6IpdigthRWqkQ1XMKwCV7lRh6gtJ3lig2oQyGEpiBYCMJ9H82VSVCw3JKNuBgOgADWZD0KgtWOQ0+imTC4ZBLC96mGKEl9W4JDStK4bRq1xiEVEQA */
  initial: "onProductPage",
  id: "atcMachine",
  context: {},
  states: {
    // This act as our entrypoint
    onProductPage: {
      on: {
        ADD_TO_CART: "cartDrawer.visible",
        BUY_NOW: "inCheckout",
      },
    },
    cartDrawer: {
      initial: "hidden",
      states: {
        hidden: {
          on: {
            CLICK_ON_CART_ICON: "#atcMachine.inCartPage",
          },
        },
        visible: {
          on: {
            CLICK_ON_HIDE_CART: "hidden",
            CLICK_ON_CART_ICON: "#atcMachine.inCartPage",
            CLICK_ON_VIEW_CART_PAGE_BUTTON: "#atcMachine.inCartPage",
          },
        },
      },
    },
    productAddedToCart: {
      on: {
        GO_TO_CHECKOUT: "inCheckout",
      },
    },
    inCartPage: {
      on: {
        GO_TO_CHECKOUT: "inCheckout",
      },
    },
    inCheckout: {
      type: "final",
    },
  },
})

// Not quite sure of this pattern compared to simply use `meta`
const gen = genPwMetas<typeof advancedAddToCartMachine>((page) => {
  return {
    states: {
      inCartPage: {
        meta: {
          urlRegex: new RegExp(
            `^${e2eConfig.localBaseShopUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}/cart`,
            "i",
          ),
          waitFor: true,
          expectUrl: true,
        },
      },
      onProductPage: {
        decoratedHandler: async () => {
          await page.goto(singleProductPageBaseUrl)
          await page.waitForURL(singleProductPageBaseUrl)
        },
      },
      "cartDrawer.visible": async () => {
        await page.waitForSelector("#cart-notification")
        const cartDrawer = await page.$("#cart-notification")
        if (!cartDrawer) throw new Error("Cart drawer not found")
        const isActive = cartDrawer.evaluate((node) => node.classList.contains("active"))
        expect(isActive).toBeTruthy()
      },
      addedToCart: async () => {
        const cartItem = await page.$("#cart-notification-product")
        if (!cartItem) throw new Error("Cart item not found")
        const titleText = await cartItem.evaluate(async (node) => {
          const title = node.querySelector("h3")
          if (!title) throw new Error("Cart item title not found")
          return title.textContent
        })
        expect(titleText).toBe("The 3P Fulfilled Snowboard")
      },
      inCheckout: {
        meta: {
          urlRegex: new RegExp(
            `^(?:${e2eConfig.localBaseShopUrl.replace(
              /[-\/\\^$*+?.()|[\]{}]/g,
              "\\$&",
            )}|${e2eConfig.webBaseShopUrl.replace(
              /[-\/\\^$*+?.()|[\]{}]/g,
              "\\$&",
            )})/checkouts/.*$`,
            "i",
          ),
          waitFor: true,
          expectUrl: true,
        },
      },
      hidden: {},
    },
    events: {
      ADD_TO_CART: async () => {
        const addToCartButton = await page.$('button[name="add"]')
        if (!addToCartButton) throw new Error("Add to cart button not found")
        await addToCartButton.click()
      },
      GO_TO_CHECKOUT: async () => {
        const goToCheckoutButton = await page.$("#checkout")
        if (!goToCheckoutButton) throw new Error("Go to checkout button not found")
        await goToCheckoutButton.click()
      },
      BUY_NOW: async () => {
        const buyNowButton = await page.$(
          ".shopify-payment-button__button.shopify-payment-button__button--unbranded",
        )
        if (!buyNowButton) throw new Error("Buy now button not found")
        await buyNowButton.click()
      },
      SHOW_CART: async () => {
        const cartButton = await page.$("#cart-notification-button")
        if (!cartButton) throw new Error("Cart button not found")
        await cartButton.click()
      },
      CLICK_ON_VIEW_CART_PAGE_BUTTON: async () => {
        const viewCartPageButton = await page.$("#cart-notification-button")
        if (!viewCartPageButton) throw new Error("View cart page button not found")
        await viewCartPageButton.click()
      },
      CLICK_ON_HIDE_CART: async () => {
        const hideCartButton = await page.$(".cart-notification__close")
        if (!hideCartButton) throw new Error("Hide cart button not found")
        await hideCartButton.click()
      },
      CLICK_ON_CART_ICON: async () => {
        const cartIcon = await page.$("#cart-icon-bubble")
        if (!cartIcon) throw new Error("Cart icon not found")
        await cartIcon.click()
      },
    },
  }
})

createTestModel(advancedAddToCartMachine)
  .getSimplePaths()
  .forEach((path) => {
    test(path.description, async ({ page }) => {
      await path.test(generateXstateStateAndEventsFromPw(gen(page), page))
    })
  })
