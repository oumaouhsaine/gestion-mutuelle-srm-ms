const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false, // Disabling support file for a simpler setup unless needed
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
