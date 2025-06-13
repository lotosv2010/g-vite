const { normalizePath } = require("../utils");
const path = require("path");

/**
 * 创建插件容器
 * @param {object} options 配置项
 */
async function createPluginContainer({ plugins, root }) {
  class PluginContext {} // 创建插件上下文
  const container = {
    // 作用是存储插件，并调用插件的resolveId方法
    async resolveId(id, importer) {
      const ctx = new PluginContext(); // 创建插件上下文
      let resolveId = id; // 存储id
      for (const plugin of plugins) { // 遍历插件
        if (!plugin.resolveId) continue; // 如果插件没有resolveId方法，则跳过
        const result = await plugin.resolveId.call(ctx, id, importer); // 调用插件的resolveId方法
        if (result) {
          resolveId = result.id || result; // 存储id
          break;
        }
      }
      return { id: normalizePath(resolveId) }; // 返回id
    },
  };
  return container;
}
exports.createPluginContainer = createPluginContainer;
