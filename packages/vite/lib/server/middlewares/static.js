const static = require("serve-static");

/**
 * 静态资源服务中间件
 * @param {object} options 配置项 
 */
function serverStaticMiddleware({ root }) {
  return static(root);
}

module.exports = serverStaticMiddleware;
