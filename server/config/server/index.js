import process from 'process';
import devServer from './development';
import testServer from './test';
import prodServer from './production';

let server = {};

switch (process.env.KXD_RELEASE) {
case 'development':
  server = devServer;
  break;
case 'test':
  server = testServer;
  break;
case 'production':
  server = prodServer;
  break;
}

export default server;
