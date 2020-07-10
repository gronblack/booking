const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const PAGES_LOC = baseWebpackConfig.externals.pages;
const buildWebpackConfig = merge(baseWebpackConfig, {
  mode: "production",
  plugins: [
    ...PAGES_LOC.PAGES.map(page => new HtmlWebpackPlugin({
      template: `${PAGES_LOC.PAGES_DIR}/${page}`,
      filename: page.replace(/\.pug/, ".html")
    })),
    new CleanWebpackPlugin()
  ]
});

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig);
});