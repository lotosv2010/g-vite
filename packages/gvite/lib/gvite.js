const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const configCmd = require("@g-vite/config/lib/command");
const createCmd = require("@g-vite/create/lib/command");

async function main() {
  const cli = yargs(hideBin(process.argv));
  cli
    .scriptName("create-gvite")
    .usage(`Usage: create-gvite|gva <command> [options]`)
    .demandCommand(1, "至少需要一个命令")
    .strict()
    .recommendCommands()
    .command(configCmd)
    .command(createCmd)
    .help()
    .alias("help", "h")
    .version()
    .alias("version", "v")
    .parse();
}

main().catch((err) => {
  console.error(err);
});
