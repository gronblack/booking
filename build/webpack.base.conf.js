const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

function _path(p) {
  return path.join(__dirname, p);
}

const PATHS = {
  src: _path('../src'),
  dist: _path('../dist'),
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
      filename: `js/[name].[contenthash].js`,
      path: PATHS.dist
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor1: {
          name: "vendors",
          test: /(node_modules)/,
          chunks: "all",
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules/"
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.scss$/,
        exclude: "/node_modules/",
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
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      "~datepicker": _path('../node_modules/air-datepicker/')
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new CopyWebpackPlugin([
      { from: `${PATHS.src}/fonts`, to: `${PATHS.dist}/fonts` },
      { from: `${PATHS.src}/img`, to: `${PATHS.dist}/img` }
    ]),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};