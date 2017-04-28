import webpack from 'webpack';
import webpackBaseConfig from './webpackBaseConfig';
import webpackMerge from 'webpack-merge';

export default webpackMerge.smart(webpackBaseConfig, {
  devtool: 'cheap-module-source-map',
  //plugins: [new webpack.NoEmitOnErrorsPlugin()],
});
