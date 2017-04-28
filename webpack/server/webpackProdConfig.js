import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import webpackBaseConfig from './webpackBaseConfig';

export default webpackMerge.smart(webpackBaseConfig, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ],
});
