const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PAGES_LOC = baseWebpackConfig.externals.pages;
const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  entry: {
    app: `${baseWebpackConfig.externals.paths.src}/dev.js`
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: baseWebpackConfig.externals.paths.dist,
    port: 8081,
    overlay: {
      warnings: true,
      errors: true
    }
  },
  plugins: [
    ...PAGES_LOC.PAGES.map(page => new HtmlWebpackPlugin({
      template: `${PAGES_LOC.PAGES_DIR}/${page}`,
      filename: page.replace(/\.pug/, '.html')
    })),
    ...PAGES_LOC.PAGES_UI.map(page => new HtmlWebpackPlugin({
      template: `${PAGES_LOC.PAGES_DIR}/dev/${page}`,
      filename: 'dev/' + page.replace(/\.pug/, '.html')
    })),
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    })
  ]
});

module.exports = new Promise((resolve, reject) => {
  resolve(devWebpackConfig);
});