/** @type {import('jest').Config} */
export default {
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js"],
  testMatch: ["**/tests/**/*.test.js"],
  transformIgnorePatterns: ["/node_modules/"],
  verbose: true,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".js"],
};
