const connect = require("connect");
const http = require("http");
const { printInfo } = require("../utils");
const serverStaticMiddleware = require("./middlewares/static");
const resolveConfig = require("../config");
const { createOptimizeDepsRun } = require("../optimizer");

/**
 * 优化依赖，找到本项目依赖的第三方模块
 * @param {object} config 配置项
 * @param {object} server 服务器实例
 */
async function runOptimize(config, server) {
  const optimizeDeps = await createOptimizeDepsRun(config);
  server._optimizeDepsMetadata = optimizeDeps.metadata;
  console.log(server._optimizeDepsMetadata);
}

/**
 * 创建服务器
 * @returns Promise<Server> 服务器实例
 */
async function createServer() {
  const middlewares = connect();
  const config = await resolveConfig();

  const server = {
    async listen(port) {
      //! 1.找到本项目依赖的第三方模块
      await runOptimize(config, server);
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
