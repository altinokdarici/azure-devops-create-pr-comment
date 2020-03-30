const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
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
    filename: "index.js",
    path: path.resolve(__dirname, "dist")
  }
};
