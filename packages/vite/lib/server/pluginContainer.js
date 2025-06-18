const { normalizePath } = require("../utils");
const path = require("path");

/**
 * 创建插件容器
 * @param {object} options 配置项
 */
async function createPluginContainer({ plugins, root }) {
  // 创建插件上下文
  class PluginContext {
    // 解析id
    async resolve(id, importer = path.join(root, "index.html")) {
      return await container.resolveId(id, importer);
    }
  }
  const container = {
    // 作用是存储插件，并调用插件的resolveId方法
    async resolveId(id, importer) {
      const ctx = new PluginContext(); // 创建插件上下文
      let resolveId = id; // 存储id
      for (const plugin of plugins) {
        // 遍历插件
        if (!plugin.resolveId) continue; // 如果插件没有resolveId方法，则跳过
        const result = await plugin.resolveId.call(ctx, id, importer); // 调用插件的resolveId方法
        if (result) {
          resolveId = result.id || result; // 存储id
          break;
        }
      }
      return { id: normalizePath(resolveId) }; // 返回id
    },
    // 加载文件
    async load(id) {
      // 创建插件上下文
      const ctx = new PluginContext();
      for (const plugin of plugins) {
        // 遍历插件
        if (!plugin.load) continue; // 如果插件没有load方法，则跳过
        const result = await plugin.load.call(ctx, id); // 调用插件的load方法
        if (result) {
          return result; // 返回结果
        }
      }
      return null; // 如果没有插件返回null
    },
    // 转换文件
    async transform(code, id) {
      // 创建插件上下文
      const ctx = new PluginContext();
      for (const plugin of plugins) {
        // 遍历插件
        if (!plugin.transform) continue; // 如果插件没有transform方法，则跳过
        const result = await plugin.transform.call(ctx, code, id); // 调用插件的transform方法
        if (!result) continue; // 如果没有返回结果，则跳过
        code = result.code || result; // 存储代码
      }
      return { code };
    },
  };
  return container;
}
exports.createPluginContainer = createPluginContainer;
