const { createServer } = require("./server");

/**
 * 启动服务
 */
async function start() {
  const server = await createServer();
  server.listen(5173);
}

start();
