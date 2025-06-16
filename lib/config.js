const path = require("path");
const { normalizePath } = require("./utils");

/**
 * 解析配置文件
 * @returns {Promise<{root: string}>} 配置对象
 */
async function resolveConfig() {
  const root = normalizePath(process.cwd()); // 项目根目录
  const cacheDir = normalizePath(path.resolve(`node_modules/.g-vite`)); // 缓存目录
  const config = {
    root,
    cacheDir
  };
  return config;
}

module.exports = resolveConfig;
