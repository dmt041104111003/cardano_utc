const webpack = require('webpack');

module.exports = function override(config) {
  // Thêm fallback cho các module Node.js
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "vm": require.resolve("vm-browserify"),
  };

  // Thêm plugin để cung cấp Buffer và process
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: require.resolve('process'),
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  );

  return config;
};
