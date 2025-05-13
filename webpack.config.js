const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    mode: isProd ? "production" : "development",
    entry: "./src/js/index.js",
    output: {
      filename: "bundle.[contenthash].js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    devtool: isProd ? "source-map" : "eval-source-map",
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      port: 3000,
      open: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.html$/i,
          loader: "html-loader",
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new Dotenv(),  // This will load the .env file and inject variables into the build
    ],
  };
};
