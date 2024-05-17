class t extends HTMLElement {
  constructor() {
    super(),
      (this.button = this.querySelector("button")),
      (this.output = this.querySelector("output")),
      this.button.addEventListener("click", () => {
        this.output.value = String(+this.output.value + 1)
      })
  }
}
window.customElements.define("hello-world", t)
