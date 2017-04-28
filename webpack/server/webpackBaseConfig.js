import fs from 'fs';
import path from 'path';
import process from 'process';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import listEntries from '../utils/listEntries';
import server from '../../server/config/server';

const env = process.env.NODE_ENV;
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(env),
  __DEV__: JSON.stringify(env === 'development'),
  __SERVER__: JSON.stringify(server),
};

const root = process.cwd();
const dirs = { res: 'server', dist: 'build/server', tmp: '.tmp/server' };
const baseDir = `${dirs.res}`;
const outputPath = dirs.dist;

//const entryRoot = path.join(baseDir, 'views');
//const entries = listEntries(entryRoot, 'views/');
//entries['main'] = 'server/main.js';

const entries = { main: 'server/main.js' };

export default {
  name: 'server',
  target: 'node',
  context: root,
  entry: entries,
  externals: [nodeExternals()],
  output: {
    path: path.join(root, outputPath),
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false,
    console: false,
    global: false,
    process: false,
    Buffer: false
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
    new webpack.LoaderOptionsPlugin({
      test: /\.scss$/,
      debug: true,
      options: {
        output: {
          path: path.join(root, outputPath)
        },
        context: root,
        sassLoader: {
          includePaths: [
            path.resolve(root, `${baseDir}/styles`)
          ]
        }
      }
    }),
    new CopyPlugin([{
      from: 'server/views',
      to: 'views',
    }]),
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
            ['es2015', { modules: false }],
            'react',
            'stage-0'
          ],
          plugins: [
            'transform-runtime',
            'transform-decorators-legacy',
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    modules: [root, path.join(root, baseDir), 'node_modules']
  }
};
