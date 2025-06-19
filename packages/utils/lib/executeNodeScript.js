const spawn = require("cross-spawn");

async function executeNodeScript({ cwd }, source, args) {
  return new Promise((resolve) => {
    const childProcess = spawn(
      process.execPath, // node 的可执行路径
      ["-e", source, "--", JSON.stringify(args)],
      { cwd, stdio: "inherit" }
    );
    childProcess.on("close", resolve);
  });
}

module.exports = executeNodeScript;
