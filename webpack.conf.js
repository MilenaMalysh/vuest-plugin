var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',

  module: {
    rules: [
      {test: /\.js$/, use: 'babel-loader'}
    ]
  },
  context: __dirname,
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'vuest-plugin.js'
  },
  node: {
    fs: 'empty'
  }
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
