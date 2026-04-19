// @ts-check
module.exports = {
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'python -m http.server 4173',
    port: 4173,
    reuseExistingServer: true,
  },
};
