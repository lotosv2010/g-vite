const { getCommandSource } = require("@g-vite/settings");
const { executeNodeScript } = require("@g-vite/utils");

const command = {
  command: "create [name]",
  describe: "create a new project in the current directory",
  builder: (yargs) => {
    yargs.option("name", {
      type: "string",
      description: "project name",
      default: "g-vite-project",
    });
  },
  handler: async function (argv) {
    const args = { name: argv.name, cwd: process.cwd() };
    const COMMAND_SOURCE = getCommandSource("create");
    await executeNodeScript({ cwd: __dirname }, COMMAND_SOURCE, args);
  },
};

module.exports = command;
