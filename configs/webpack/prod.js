// production config
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const { resolve } = require('path');
const commonConfig = require('./common');
const dotenv = require('dotenv').config({
  path: __dirname + '/../../.env.prod',
});

console.log('BASE_URL', dotenv.parsed);

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './index.tsx',
  output: {
    filename: 'js/bundle.[contenthash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
  ],
});
