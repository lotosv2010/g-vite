const connect = require("connect");
const http = require("http");
const { printInfo } = require("../utils");
const serverStaticMiddleware = require("./middlewares/static");
const resolveConfig = require("../config");

/**
 * 创建服务器
 * @returns Promise<Server> 服务器实例
 */
async function createServer() {
  const middlewares = connect();
  const config = await resolveConfig();

  const server = {
    async listen(port) {
      http.createServer(middlewares).listen(port, async () => {
        printInfo(port);
      });
    },
  };

  // 静态资源处理
  middlewares.use(serverStaticMiddleware(config));

  return server;
}

exports.createServer = createServer;
