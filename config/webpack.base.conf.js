const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

var _path = function (p) {
  return path.join(__dirname, p);
};

const PATHS = {
  src: _path('../src'),
  dist: _path('../dist'),
};
const PAGES = {
  // Pages const for HtmlWebpackPlugin
  PAGES_DIR: `${PATHS.src}/pug`,
  PAGES: fs.readdirSync(`${PATHS.src}/pug`).filter(fileName => fileName.endsWith('.pug')),
  PAGES_UI: fs.readdirSync(`${PATHS.src}/pug/dev`).filter(fileName => fileName.endsWith('.pug'))
};

// components subdirs 'img' to object array
let COMPONENTS_IMAGES = [];
fs.readdirSync(`${PATHS.src}/components/`).forEach(dirName => {
  var from = `${PATHS.src}/components/${dirName}/img/`;
  if (fs.existsSync(from))
    COMPONENTS_IMAGES.push({ from: from, to: `${PATHS.dist}/img/` })
});

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
      chunks: 'all'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: '/node_modules/'
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
          'css-loader?url=false'
        ]
      },
      {
        test: /\.scss$/,
        exclude: '/node_modules/',
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader?url=false'
          },
          {
            loader: 'sass-loader'
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
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      '~datepicker': _path('../node_modules/air-datepicker/')
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new CopyWebpackPlugin(
      {patterns: [
        { from: `${PATHS.src}/fonts/`, to: `${PATHS.dist}/fonts/` },
        { from: `${PATHS.src}/img/`, to: `${PATHS.dist}/img/` },
        ...COMPONENTS_IMAGES
      ]}
    ),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};