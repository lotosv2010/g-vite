const fs = require("fs-extra");
const { log, config } = require("@g-vite/utils");
const chalk = require("chalk");

async function factory(argv) {
  const { key, value } = argv;
  if (key && value) {
    config[key] = value;
    await fs.writeJSON(config.configPath, config, { spaces: 2 });
    log.info(
      `${chalk.greenBright("create-gvite")} ${chalk.magentaBright(
        "(%s=%s)"
      )} 配置成功保存至 ${chalk.greenBright("%s")}`,
      key,
      value,
      config.configPath
    );
  } else if (key) {
    log.info(chalk.magentaBright("%s=%s"), key, config[key]);
  } else {
    log.info(chalk.magentaBright(JSON.stringify(config || {})));
  }
}
module.exports = factory;
