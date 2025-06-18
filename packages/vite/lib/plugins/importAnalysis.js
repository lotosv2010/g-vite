const { init, parse } = require("es-module-lexer");
const MagicString = require("magic-string");
const path = require("path");
const { lexAcceptedHmrDeps } = require("../server/hmr");

/**
 * 导入文件分析插件
 * @param {object} config  配置对象
 * @returns {object} 插件对象
 */
function importAnalysisPlugin(config) {
  const { root } = config; // 项目根目录
  let server;
  return {
    name: "g-vite:import-analysis",
    configureServer(_server) {
      server = _server;
    },
    async transform(source, importer) {
      // 初始化 es-module-lexer
      await init;
      // 获取当前文件的所有导入
      let imports = parse(source)[0];
      // 如果没有导入，则返回源代码
      if (!imports.length) {
        return source;
      }
      const { moduleGraph } = server;
      const importerModule = moduleGraph.getModuleById(importer);
      const importedUrls = new Set();
      const acceptedUrls = new Set();
      // 创建一个 MagicString 对象
      let ms = new MagicString(source);
      // 获取导入的模块路径
      const normalizeUrl = async (url) => {
        // 解析此导入的模块的路径
        // 此处的 this  指向的是插件容器中的插件上下文对象，所以可以使用 this.resolve 来解析模块路径
        // resolve 内部其实调用的是插件容器的 resolveId 方法，返回url的绝对路径
        const resolved = await this.resolve(url, importer);
        if (resolved.id.startsWith(root + "/")) {
          //把绝对路径变成相对路径
          url = resolved.id.slice(root.length);
        }
        await moduleGraph.ensureEntryFromUrl(url);
        return url;
      };
      // 遍历导入
      for (let index = 0; index < imports.length; index++) {
        // 获取导入的位置和模块名
        const { s: start, e: end, n: specifier } = imports[index];
        const rawUrl = source.slice(start, end);
        if (rawUrl === "import.meta") {
          const prop = source.slice(end, end + 4);
          if (prop === ".hot") {
            if (source.slice(end + 4, end + 11) === ".accept") {
              lexAcceptedHmrDeps(
                source,
                source.indexOf("(", end + 11) + 1,
                acceptedUrls
              );
            }
          }
        }
        // 如果有模块名
        if (specifier) {
          // 获取url
          const normalizedUrl = await normalizeUrl(specifier);
          // 如果有变化
          if (normalizedUrl !== specifier) {
            // 替换
            ms.overwrite(start, end, normalizedUrl);
          }
          importedUrls.add(normalizedUrl);
        }
      }
      const normalizedAcceptedUrls = new Set();
      const toAbsoluteUrl = (url) =>
        path.posix.resolve(path.posix.dirname(importerModule.url), url);
      for (const { url, start, end } of acceptedUrls) {
        const [normalized] = await moduleGraph.resolveUrl(toAbsoluteUrl(url));
        normalizedAcceptedUrls.add(normalized);
        ms.overwrite(start, end, JSON.stringify(normalized));
      }
      await moduleGraph.updateModuleInfo(
        importerModule,
        importedUrls,
        normalizedAcceptedUrls
      );
      return ms.toString();
    },
  };
}
module.exports = importAnalysisPlugin;
