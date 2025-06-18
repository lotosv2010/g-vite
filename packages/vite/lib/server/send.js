// 响应头
const alias = {
  js: "application/javascript",
  css: "text/css",
  json: "application/json",
  html: "text/html",
};

/**
 * 发送响应
 * @param {object} _req 请求对象
 * @param {object} res 响应对象
 * @param {object} content 内容
 * @param {string} type 类型
 * @returns void
 */
function send(_req, res, content, type) {
  res.setHeader("Content-Type", alias[type] + ";charset=utf-8");
  res.statusCode = 200;
  return res.end(content);
}

module.exports = send;