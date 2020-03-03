const path = require('path');
const fs = require("fs");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
      path: PATHS.dist,
      publicPath: "/"
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
      }
    ]
  },
  plugins: [
    /*...PAGES.map(page => new HtmlWebpackPlugin({
        template: PAGES_DIR + '/' + page,
        filename: page.replace(/\.pug/,".html")
    })),
    ...PAGES_UI.map(page => new HtmlWebpackPlugin({
        template: PAGES_DIR + 'UI/' + page,
        filename: 'UI/' + page.replace(/\.pug/,".html")
    })),*/
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    })
  ]
};