const os = require('os');
const chalk = require('chalk');

// 获取内网ip
function getIPAddress() {
  let IPAddress = '';
  const interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        IPAddress = alias.address;
      }
    }
  }
  return IPAddress;
};


function printInfo (port) {
  const ip = getIPAddress();
  console.log(`
    ${chalk.yellow('Starting up http-server, serving')} ${chalk.blue('./')}
    ${chalk.yellow('Available on:')}
      http://127.0.0.1:${chalk.green(port)}
      http://${ip}:${chalk.green(port)}
    Hit CTRL-C to stop the server
  `);
}

module.exports = {
  getIPAddress,
  printInfo
}