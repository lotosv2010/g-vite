const { normalizePath } = require("./utils");

/**
 * 解析配置文件
 * @returns {Promise<{root: string}>} 配置对象
 */
async function resolveConfig() {
  const root = normalizePath(process.cwd());
  const config = {
    root,
  };
  return config;
}

module.exports = resolveConfig;
