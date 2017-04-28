import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import cloneDeep from 'lodash/cloneDeep';
import webpackBaseConfig from './webpackBaseConfig';

let baseConfig = cloneDeep(webpackBaseConfig);
export default webpackMerge.smart(baseConfig, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ],
});
