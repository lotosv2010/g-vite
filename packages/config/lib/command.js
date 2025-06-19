const { executeNodeScript } = require("@g-vite/utils");
const { getCommandSource } = require("@g-vite/settings");

const command = {
  command: "config [key] [value]",
  describe: "Set or view configuration items, such as GIT_TYPE to set the repository type, ORG_NAME to set the organization name",
  builder: (yargs) => {},
  handler: async function (argv) {
    // 开启子进程，执行命令
    const COMMAND_SOURCE = getCommandSource("config");
    await executeNodeScript({ cwd: __dirname }, COMMAND_SOURCE, argv);
  },
};
module.exports = command;
