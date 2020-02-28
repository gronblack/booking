const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
    src: path.join(__dirname, './src'),
    dist: path.join(__dirname, './dist')
};

// Pages const for HtmlWebpackPlugin
const PAGES_DIR = PATHS.src + '/pug/';
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'));
const PAGES_UI = fs.readdirSync(PAGES_DIR + '/UI/').filter(fileName => fileName.endsWith('.pug'));

module.exports = {
    entry: PATHS.src,
    output: {
        path: PATHS.dist,
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            }
        ]
    },
    plugins: [
        ...PAGES.map(page => new HtmlWebpackPlugin({
            template: PAGES_DIR + '/' + page,
            filename: page.replace(/\.pug/,".html")
        })),
        ...PAGES_UI.map(page => new HtmlWebpackPlugin({
            template: PAGES_DIR + 'UI/' + page,
            filename: 'UI/' + page.replace(/\.pug/,".html")
        }))
    ]
};