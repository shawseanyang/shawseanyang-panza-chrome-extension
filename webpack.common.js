'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
require('dotenv').config(); // If you're using dotenv

module.exports = {
  entry: {
    content: './src/content.js',
    pageWorld: '@inboxsdk/core/pageWorld.js',
    background: '@inboxsdk/core/background.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "static" },
      ],
    }),
    // Inject the API key environment variable from the .env file
    new webpack.DefinePlugin({
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    }),
  ],
};
