// 执行命令的源代码
exports.getCommandSource = (filename) => `
const args = JSON.parse(process.argv[1]);
const factory = require('./${filename}');
factory(args);
`;

// 配置文件名
exports.RC_NAME = ".gviterc";
