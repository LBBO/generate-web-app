const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
