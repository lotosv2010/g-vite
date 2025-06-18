/**
 * 预处理别名
 * @returns {object} 插件对象
 */
function preAliasPlugin() {
  let server;
  return {
    name: "g-vite:pre-alias",
    // 配置服务
    configureServer(_server) {
      server = _server;
    },
    resolveId(id) {
      // 把vue=>vue.js
      const metadata = server._optimizeDepsMetadata; // 获取优化依赖的元数据
      const isOptimized = metadata.optimized[id]; // 是否优化的依赖
      if (isOptimized) {
        return {
          id: isOptimized.file, //// vue => c:/node_modules/.vite/deps/vue.js
        };
      }
    },
  };
}
module.exports = preAliasPlugin;
