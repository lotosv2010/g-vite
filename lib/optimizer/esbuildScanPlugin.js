const fs = require("fs-extra");
const path = require("path");
const { createPluginContainer } = require("../server/pluginContainer");
const resolvePlugin = require("../plugins/resolve");
const { normalizePath } = require("../utils");

const htmlTypesRE = /\.html$/; // html文件
const scriptModuleRE = /<script type="module" src\="(.+?)"><\/script>/; // 脚本模块
const JS_TYPES_RE = /\.js$/; // js文件

/**
 * 获取esbuild扫描插件的工厂方法
 * @param {object} config 配置对象
 * @param {object} depImports 依赖对象
 */
async function esbuildScanPlugin(config, depImports) {
  config.plugins = [resolvePlugin(config)]; // 添加解析插件
  const container = await createPluginContainer(config); // 创建插件容器
  // 创建解析方法
  const resolve = async (id, importer) => {
    return await container.resolveId(id, importer);
  };
  return {
    name: "g-vite:dep-scan",
    setup(build) {
      build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer); // 解析路径
        if (resolved) {
          return {
            path: resolved.id || resolved,
            namespace: "html",
          };
        }
      });
      build.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer); // 解析路径
        if (resolved) {
          const id = resolved.id || resolved; // 获取id
          const included = id.includes("node_modules"); // 判断是否是第三方包
          if (included) {
            depImports[path] = normalizePath(id); // 添加到依赖列表中
            return {
              path: id,
              external: true,
            };
          }
          return {
            path: id,
          };
        }
        return { path };
      });
      build.onLoad(
        { filter: htmlTypesRE, namespace: "html" },
        async ({ path }) => {
          const html = fs.readFileSync(path, "utf-8"); // 读取html文件
          const [, scriptSrc] = html.match(scriptModuleRE); // 匹配script标签
          const js = `import ${JSON.stringify(scriptSrc)};\n`; // 生成js代码
          return {
            loader: "js",
            contents: js,
          };
        }
      );
      build.onLoad({ filter: JS_TYPES_RE }, ({ path: id }) => {
        let ext = path.extname(id).slice(1); // 获取文件后缀
        let contents = fs.readFileSync(id, "utf-8"); // 读取文件
        return {
          loader: ext,
          contents,
        };
      });
    },
  };
}
module.exports = esbuildScanPlugin;
