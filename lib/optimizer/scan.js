const { build } = require("esbuild");
const esbuildScanPlugin = require("./esbuildScanPlugin");

/**
 * 扫描项目依赖
 * @param {object} config 配置对象
 */
async function scanImports(config) {
  const depImports = {}; // 存放依赖导入
  const esPlugin = await esbuildScanPlugin(config, depImports); // 创建esbuild插件
  await build({
    absWorkingDir: config.root, // 工作目录
    entryPoints: ["./index.html"], // 入口文件
    bundle: true, // 打包
    format: "esm", // esm格式
    outfile: "dist/index.js", // 输出文件
    write: false, // true为写入文件, false为不写入文件
    plugins: [esPlugin], // 插件
  });
  return depImports;
}

module.exports = scanImports;
