const connect = require("connect");
const http = require("http");
const chokidar = require("chokidar");
const path = require("path");
const serverStaticMiddleware = require("./middlewares/static");
const resolveConfig = require("../config");
const { createOptimizeDepsRun } = require("../optimizer");
const transformMiddleware = require("./middlewares/transform");
const { createPluginContainer } = require("./pluginContainer");
const { handleHMRUpdate } = require("./hmr");
const { createWebSocketServer } = require("./ws");
const { normalizePath } = require("../utils");
const { ModuleGraph } = require("./moduleGraph");

/**
 * 优化依赖，找到本项目依赖的第三方模块
 * @param {object} config 配置项
 * @param {object} server 服务器实例
 */
async function runOptimize(config, server) {
  const optimizeDeps = await createOptimizeDepsRun(config);
  server._optimizeDepsMetadata = optimizeDeps.metadata;
}

/**
 * 创建服务器
 * @returns Promise<Server> 服务器实例
 */
async function createServer() {
  const middlewares = connect(); // 创建中间件
  const config = await resolveConfig(); // 获取配置项
  const pluginContainer = await createPluginContainer(config); // 创建插件容器
  const httpServer = http.createServer(middlewares);
  const ws = createWebSocketServer(httpServer, config);
  const watcher = chokidar.watch(path.resolve(config.root), {
    ignored: ["**/node_modules/**", "**/.git/**"],
  });

  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url));

  const server = {
    config,
    ws,
    watcher,
    moduleGraph,
    httpServer,
    pluginContainer,
    async listen(port) {
      //! 1.找到本项目依赖的第三方模块
      await runOptimize(config, server);
      await httpServer.listen(port);
    },
  };

  watcher.on('change', async (file) => {
    file = normalizePath(file)
    await handleHMRUpdate(file, server)
  });

  // 遍历插件
  for (const plugin of config.plugins) {
    // 如果存在configureServer方法
    if (plugin.configureServer) {
      // 调用configureServer方法
      await plugin.configureServer(server);
    }
  }
  // ! 3.修改导入路径
  middlewares.use(transformMiddleware(server));
  // 静态资源处理
  middlewares.use(serverStaticMiddleware(config));

  return server;
}

exports.createServer = createServer;
