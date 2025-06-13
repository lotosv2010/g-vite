const { createServer } = require("./server");

async function start() {
  const server = await createServer();
  server.listen(5173);
}

start();
