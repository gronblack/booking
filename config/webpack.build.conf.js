const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

const PAGES_LOC = baseWebpackConfig.externals.pages;
const buildWebpackConfig = merge(baseWebpackConfig, {
  mode: "production",
  plugins: [
    ...PAGES_LOC.PAGES.map(page => new HtmlWebpackPlugin({
      template: `${PAGES_LOC.PAGES_DIR}/${page}`,
      filename: page.replace(/\.pug/, ".html")
    })),
    new ImageminPlugin({
      mozjpeg: {
        progressive: true,
        quality: 90
      },
      optipng: {
        optimizationLevel: 1
      },
      pngquant: {
        strip: true,
        quality: 80-90
      },
      svgo: {
        removeDoctype: true
      },
      gifsicle: {
        interlaced: true
      }
    }),
    new CleanWebpackPlugin()
  ]
});

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig);
});