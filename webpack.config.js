const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.ts",
    bumpVersion: "./src/bumpVersion.ts"
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist")
  }
};
