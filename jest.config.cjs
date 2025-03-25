/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  moduleNameMapper: {
    "^(.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js"],
  testMatch: ["**/tests/**/*.test.js"],
  transformIgnorePatterns: ["/node_modules/"],
  verbose: true,
  extensionsToTreatAsEsm: [".js"],
  testTimeout: 10000
};
