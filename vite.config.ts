import adastra from "adastra-plugin"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [adastra()],
  build: {
    emptyOutDir: false,
  },
})
