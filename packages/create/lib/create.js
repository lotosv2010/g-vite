const { confirm, input } = require("@inquirer/prompts");
const path = require("path");
const { redBright, greenBright, yellowBright } = require("chalk");
const fs = require("fs-extra");
const { config, log } = require("@g-vite/utils");

async function factory(argv) {
  const { cwd, name } = argv;
  process.chdir(cwd); // 切换为当前命令执行的工作目录
  const { ORG_NAME } = config;
  if (!ORG_NAME) {
    log.error(`not set organization name!`);
    return;
  }
  const projectName = await input({
    message: `Project name:`,
    default: name,
    required: true,
  });
  const targetDir = path.join(process.cwd(), projectName);
  log.info(
    greenBright("create-gvite"),
    `create project in ${yellowBright(targetDir)}`
  );
  try {
    await fs.access(targetDir);
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      const answer = await confirm({
        default: true,
        message: `Target directory ${redBright(
          targetDir
        )} is not empty. Remove existing files and continue?`,
      });
      if (answer) {
        await fs.emptyDir(targetDir);
      } else {
        log.error("action canceled");
        return;
      }
    }
  } catch (error) {
    await fs.mkdirp(targetDir);
    log.info(
      greenBright("create-gvite"),
      `${yellowBright(targetDir)} directory is ready`
    );
  }
}
module.exports = factory;
