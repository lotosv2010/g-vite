const chalk = require("chalk");
const { createServer } = require("./server");
const { printInfo } = require("./utils");

/**
 * 启动服务
 */
async function start() {
  let PORT = 5173;
  const { httpServer, listen } = await createServer();
  listen(5173);
  httpServer.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error(chalk.magentaBright("Address in use, retrying..."));
      PORT += 1;
      setTimeout(() => {
        httpServer.close();
        listen(PORT);
      }, 1000);
    }
  });
  httpServer.on("listening", () => {
    printInfo(PORT);
  });
}

start();
