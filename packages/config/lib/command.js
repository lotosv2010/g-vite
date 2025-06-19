const { executeNodeScript } = require("@g-vite/utils");
const { COMMAND_SOURCE } = require("@g-vite/settings");

const command = {
  command: "config [key] [value]",
  describe: "设置或查看配置项,比如GIT_TYPE设置仓库类型，ORG_NAME设置组织名",
  builder: (yargs) => {},
  handler: async function (argv) {
    // 开启子进程，执行命令
    await executeNodeScript({ cwd: __dirname }, COMMAND_SOURCE, argv);
  },
};
module.exports = command;
