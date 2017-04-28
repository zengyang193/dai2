import fs from 'fs';
import path from 'path';
import process from 'process';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import listEntries from '../utils/listEntries';
import server from '../../server/config/server';

const env = process.env.NODE_ENV;
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(env),
  __DEV__: JSON.stringify(env === 'development'),
};
const root = process.cwd();
const dirs = { res: 'client', dist: 'build/client', tmp: '.tmp/client' };
const baseDir = `${dirs.res}`;
const outputPath = dirs.dist;

const entryRoot = path.join(baseDir, 'scripts/pages');
const entries = listEntries(entryRoot);

entries['vendor'] = [
  'react',
  'react-dom',
  'react-router',
  'mobx',
  'mobx-react',
  'axios'
];

entries['dsui'] = [
  'onsenui',
  'react-onsenui',
  'onsenui/css/onsenui.css',
  'onsenui/css/onsen-css-components.css',
  'styles/onsen_kxd_theme.scss',
];

export default {
  target: 'web',
  context: root,
  entry: entries,
  output: {
    path: path.join(root, outputPath),
    publicPath: server.h5root + '/',
    filename: 'scripts/[name].[hash:6].js'
  },
  plugins: [
    //Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),
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
    new webpack.optimize.CommonsChunkPlugin({
      name: ['dsui', 'vendor'],
      filename: 'scripts/[name].[hash:6].js'
    }),
    new ExtractTextPlugin('styles/[name].[hash:6].css'),
    new AssetsPlugin({
      filename: 'assetsManifest.json',
      path: env === 'development' ? `${root}/server/views` : `${root}/build/server/views`,
      pretttyPrint: true,
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
          ]
        }
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              sourceMap: env !== 'production',
              modules: false
            }
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  autoprefixer({
                    browsers: ['Android >= 4.0', 'iOS >= 7']
                  }),
                ]
              },
            },
          }, {
            loader: 'resolve-url-loader'
          }]
        })
      }, {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: { sourceMap: env !== 'production', modules: false }
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  autoprefixer({
                    browsers: ['Android >= 4.0', 'iOS >= 7']
                  }),
                ]
              },
            },
          }, {
            loader: 'resolve-url-loader'
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: env !== 'production',
              includePaths: ['client/styles']
            }
          }]
        })
      }, {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader',
        options: {
          name: 'styles/fonts/[name].[sha512:hash:base64:6].[ext]'
        }
      }, {
        test: /\.(png|jp(e)?g)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[sha512:hash:base64:6].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js', '.es6'],
    modules: [root, path.join(root, baseDir), 'node_modules']
  }
};
