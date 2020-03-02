const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = {
    src: path.resolve(__dirname, './src'),
    dist: path.resolve(__dirname, './dist')
};

// Pages const for HtmlWebpackPlugin
const PAGES_DIR = PATHS.src + '/pug/';
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'));
const PAGES_UI = fs.readdirSync(PAGES_DIR + '/UI/').filter(fileName => fileName.endsWith('.pug'));

module.exports = {
    entry: {
        app: PATHS.src + '/index.js'
    },
    output: {
        path: PATHS.dist,
        filename: '[name].js'
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
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'sass-loader', options: { sourceMap: true } },
                ]
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
        })),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    resolve: {
        extensions: ['.js', '.scss', '.pug']
    }
};