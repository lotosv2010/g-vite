// 执行命令的源代码
exports.COMMAND_SOURCE = `
const args = JSON.parse(process.argv[1]);
const factory = require('./config');
factory(args);
`;

// 配置文件名
exports.RC_NAME = ".gviterc";
