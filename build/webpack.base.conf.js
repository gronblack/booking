const path = require('path');
const fs = require("fs");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, '../src'),
  dist: path.join(__dirname, '../dist'),
};
const PAGES = {
  // Pages const for HtmlWebpackPlugin
  PAGES_DIR: `${PATHS.src}/pug`,
  PAGES: fs.readdirSync(`${PATHS.src}/pug`).filter(fileName => fileName.endsWith('.pug')),
  PAGES_UI: fs.readdirSync(`${PATHS.src}/pug/UI`).filter(fileName => fileName.endsWith('.pug'))
};

module.exports = {
  externals: {
    paths: PATHS,
    pages: PAGES
  },
  entry: {
    app: PATHS.src
  },
  output: {
      filename: `js/[name].js`,
      path: PATHS.dist
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: true }
          },
          {
            loader: "postcss-loader",
            options: { sourceMap: true }
          },
          {
            loader: "sass-loader",
            options: { sourceMap: true }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      "~": PATHS.src
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new CopyWebpackPlugin([
      { from: `${PATHS.src}/fonts`, to: `${PATHS.dist}/fonts` }
    ])
  ]
};