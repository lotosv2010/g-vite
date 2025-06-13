const connect = require("connect");
const http = require("http");
const { printInfo } = require("../utils");

async function createServer() {
  const middlewares = connect();

  const server = {
    async listen(port) {
      http.createServer(middlewares).listen(port, async () => {
        printInfo(port);
      });
    },
  };

  return server;
}

exports.createServer = createServer;
