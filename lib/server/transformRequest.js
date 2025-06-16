const fs = require("fs-extra");

/**
 * 转换请求
 * @param {url} url 请求的url
 * @param {object} server 服务器对象
 */
async function transformRequest(url, server) {
  const { pluginContainer } = server; // 获取插件容器
  const { id } = await pluginContainer.resolveId(url); // 获取此文件的绝对路径
  const loadResult = await pluginContainer.load(id); // 获取此文件的内容
  let code;
  if (loadResult) {
    // 如果有loadResult，则使用loadResult.code
    code = loadResult.code;
  } else {
    // 否则使用fs.readFileSync
    code = fs.readFileSync(id, "utf-8");
  }
  // 使用插件容器的transform方法转化文件内容
  const transformResult = await pluginContainer.transform(code, id);
  return transformResult;
}

module.exports = transformRequest;
