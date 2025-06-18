const path = require("path");
const fs = require("fs-extra");
const { normalizePath } = require("./utils");
const { resolvePlugins } = require("./plugins");

/**
 * 解析配置文件
 * @returns {Promise<{root: string}>} 配置对象
 */
async function resolveConfig() {
  const root = normalizePath(process.cwd()); // 项目根目录
  const cacheDir = normalizePath(path.resolve(`node_modules/.g-vite`)); // 缓存目录
  let config = {
    root,
    cacheDir,
  };
  const jsconfigFile = path.resolve(root, "vite.config.js");
  const exists = await fs.pathExists(jsconfigFile);
  if (exists) {
    // 如果存在 vite.config.js 文件，则使用 require 引入
    const userConfig = require(jsconfigFile);
    config = { ...config, ...userConfig };
  }
  const userPlugins = config.plugins || [];
  for (const plugin of userPlugins) {
    if (plugin.config) {
      const res = await plugin.config(config);
      if (res) {
        config = { ...config, ...res };
      }
    }
  }
  const plugins = await resolvePlugins(config, userPlugins); // 获取插件
  config.plugins = plugins;
  return config;
}

module.exports = resolveConfig;
