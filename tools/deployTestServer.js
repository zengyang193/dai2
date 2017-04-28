import fs from 'fs';
import { Client } from 'ssh2';
import { Spinner } from 'cli-spinner';
import { EventEmitter } from 'events';
import pkg from '../package.json';

class Deployer extends EventEmitter {
  constructor () {
    super();

    this.conn = new Client();
    this.config = {
      debug: true,
      host: '121.43.177.8',
      port: 2222,
      username: 'root',
      passphrase: 'xiarui2015',
      privateKey: fs.readFileSync(`${process.env.HOME}/.ssh/tree_finance_rsa`)
    };

    this.on('ready', this.onReady);
  }

  onReady () {
    console.log('🚀 已连接至测试服务器');
    this.uploadArchive();
  }

  deploy () {
    this.conn.on('ready', () => this.emit('ready')).connect(this.config);
  }

  uploadArchive () {
    this.conn.sftp((err, sftp) => {
      if (err) {
        console.log('上传部署包至测试环境失败：%s', err);
        process.exit(2);
      }

      let spinner = new Spinner('%s 正在上传部署包至测试环境...');
      spinner.setSpinnerString(19);
      spinner.start();

      let readStream = fs.createReadStream(`${__dirname}/../${pkg.name}-${pkg.version}.zip`);
      let writeStream = sftp.createWriteStream(`/dashu/nodeapp/${pkg.name}-${pkg.version}.zip`)

      writeStream.on('close', () => {
        spinner.stop(false);
        console.log('\n🍺 上传部署包至测试环境完成');
        sftp.end();
        this.extractArchive();
      });

      readStream.pipe(writeStream);
    });
  }

  extractArchive () {
    this.conn.exec(
      `unzip -o /dashu/nodeapp/${pkg.name}-${pkg.version}.zip -d /dashu/nodeapp/${pkg.name}`,
      (err, stream) => {
        console.log('\n🐶 正在解压测试环境部署包...');
        if (err) throw err;

        stream.on('close', (code, signal) => {
          if (code === 0) {
            console.log('🍺 解压测试环境部署包成功');
            this.restartService();
          } else {
            console.log('😂 解压测试环境部署包失败');
            this.conn.end();
            process.exit(2);
          }
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stdout.write(data.toString());
        });
      }
    );
  }

  restartService () {
    let commandStr = `cd /dashu/nodeapp/${pkg.name}/\nsh stop.sh\nsh start.sh\n`;

    this.conn.exec(commandStr, (err, stream) => {
      console.log('\n🐶 正在重启H5测试服务器...');
      if (err) throw err;

      stream.on('close', (code, signal) => {
        if (code === 0) {
          console.log('🍺 重启H5测试服务器完成');
          this.conn.end();
          process.exit(0);
        } else {
          console.log('😂 重启H5测试服务器失败');
          this.conn.end();
          process.exit(2);
        }
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stdout.write(data.toString());
      });
    })
  }
}

let deployer = new Deployer();
deployer.deploy();
