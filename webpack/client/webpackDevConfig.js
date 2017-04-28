import webpack from 'webpack';
import cloneDeep from 'lodash/cloneDeep';
import webpackMerge from 'webpack-merge';
import webpackBaseConfig from './webpackBaseConfig';

const hotDevServer = 'react-hot-loader/patch';
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

let baseConfig = cloneDeep(webpackBaseConfig);
let entries = baseConfig.entry;
Object.keys(entries).forEach((key) => {
  let val = entries[key];
  if (!Array.isArray(val)) {
    entries[key] = [hotDevServer, hotMiddlewareScript].concat(entries[key]);
  }
});
baseConfig.entry = entries;

export default webpackMerge.smart(baseConfig, {
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: /(vendor|dsui)\.\w{6}\.(js|css)/,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(es6|js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          cacheDirectory: '.tmp/babel-loader',
          presets: [
            ['env', { targets: {browsers: ['Android >= 4.4', 'iOS >= 7']}}],
            ['es2015', { modules: false }],
            'react',
            'stage-0'
          ],
          plugins: [
            'transform-runtime',
            'transform-decorators-legacy',
            'mobx-deep-action',
            'react-hot-loader/babel',
          ]
        }
      }
    ]
  },
});
