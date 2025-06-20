const { confirm, input, select } = require("@inquirer/prompts");
const path = require("path");
const {
  redBright,
  greenBright,
  yellowBright,
  cyanBright,
  blueBright,
} = require("chalk");
const fs = require("fs-extra");
const { config, log } = require("@g-vite/utils");

const CANCELLED = `Operation cancelled.`;

const FRAMEWORKS = [
  {
    name: "vue",
    color: greenBright,
    variants: [
      {
        name: "vue",
        color: yellowBright,
        display: "Javascript",
      },
      {
        name: "vue-ts",
        color: blueBright,
        display: "Typescript",
      },
    ],
  },
  {
    name: "react",
    color: cyanBright,
    variants: [
      {
        name: "react",
        color: yellowBright,
        display: "Javascript",
      },
      {
        name: "react-ts",
        color: blueBright,
        display: "Typescript",
      },
    ],
  },
];

process.on("uncaughtException", (error) => {
  log.error(redBright(CANCELLED), error);
  process.exit(1);
});
async function factory(argv) {
  const { cwd, name } = argv;
  process.chdir(cwd); // 切换为当前命令执行的工作目录
  // const { ORG_NAME } = config;
  // if (!ORG_NAME) {
  //   log.error(`not set organization name!`);
  //   return;
  // }

  // 1.Get project name and target dir
  const packageName = await input({
    message: `Project name:`,
    default: name,
    required: true,
  });
  const targetDir = path.join(process.cwd(), packageName);

  // 2. Handle directory if exist and not empty
  try {
    await fs.access(targetDir);
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      const overwrite = await confirm({
        default: true,
        message: `Target directory ${redBright(
          targetDir
        )} is not empty. Remove existing files and continue?`,
      });
      if (overwrite) {
        await fs.emptyDir(targetDir);
      } else {
        log.error(CANCELLED);
        return;
      }
    }
  } catch (error) {
    await fs.mkdirp(targetDir);
  }

  // 3.select framework and variant
  const framework = await select({
    message: `Select a framework:`,
    choices: FRAMEWORKS.map(({ name, color }) => ({
      name: color(name),
      value: name,
    })),
  });

  const variant = await select({
    message: `Select a variant:`,
    choices: FRAMEWORKS.filter(({ name }) => name === framework)[0][
      "variants"
    ].map(({ name, color, display }) => ({
      name: color(display),
      value: name,
    })),
  });

  // 4.copy template
  const templateDir = path.resolve(__dirname, `../template-${variant}`);
  const files = await fs.readdir(templateDir);
  for (const file of files.filter((file) => file !== "package.json")) {
    await fs.copy(path.join(templateDir, file), path.join(targetDir, file));
  }

  // 5.modify package.json
  const pkg = JSON.parse(
    await fs.readFile(path.join(templateDir, "package.json"), "utf-8")
  );
  pkg.name = packageName;
  await fs.writeFile(
    path.join(targetDir, "package.json"),
    JSON.stringify(pkg, null, 2)
  );
  // 6.init git
  const { execa } = await import("execa");
  await execa("git", ["init"], { cwd: targetDir });
  
  log.info(`Scaffolding project in ${yellowBright(targetDir)}...`);
  log.info(
    `
    ${greenBright("Done. Now run:")}
    
  ${yellowBright("cd %s")}
  ${yellowBright("npm install")}
  ${yellowBright("npm run dev")}
  `,
    packageName
  );
}
module.exports = factory;
