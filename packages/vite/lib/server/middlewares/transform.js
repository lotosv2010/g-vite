const { parse } = require("url");
const { isJSRequest } = require("../../utils");
const send = require("../send");
const transformRequest = require("../transformRequest");

function transformMiddleware(server) {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const url = parse(req.url).pathname;
    // 如果导入的是js文件需要重写第三方模块的路径
    if (isJSRequest(url)) {
      // 切记这个地方要把req.url传给transformRequest，不是url,否则会丢失query
      const result = await transformRequest(req.url, server);
      if (result) {
        const type = "js";
        return send(req, res, result.code, type);
      } else {
        next();
      }
    } else {
      next();
    }
  };
}

module.exports = transformMiddleware;
