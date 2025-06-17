const fs = require("fs");
const path = require("path");
const resolve = require("resolve");

function resolvePlugin(config) {
  return {
    name: "g-vite:resolve",
    resolveId(id, importer) {
      // 如果已经是绝对路径（跨平台支持）
      if (path.isAbsolute(id) && id.startsWith(config.root)) {
        return { id };
      }
      // 如果以/开头表示可能是绝对路径（POSIX系统）或相对路径
      if (id.startsWith("/")) {
        // 对于Windows系统，进一步检查是否是驱动器盘符路径（如 C:/...）
        const isWindows = process.platform === 'win32';
        if (isWindows && /^[A-Za-z]:/.test(id)) {
          // Windows 驱动器盘符路径（如 C:/...）
          return { id: path.resolve(id) };
        }
        // POSIX 系统（macOS/Linux）的绝对路径
        return { id: path.resolve(config.root, id.slice(1)) };
      }
      
      // 如果是相对路径
      if (id.startsWith(".")) {
        const basedir = path.dirname(importer);
        const resolvedPath = path.resolve(basedir, id);

        // 尝试添加 .js 扩展名
        if (!path.extname(resolvedPath)) {
          const jsPath = resolvedPath + ".js";
          if (fs.existsSync(jsPath)) {
            return { id: jsPath };
          }
        }

        // 如果resolvedPath是一个目录，尝试解析 index.js
        if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
          const indexPath = path.join(resolvedPath, "index.js");
          if (fs.existsSync(indexPath)) {
            return { id: indexPath };
          }
        }
        return { id: resolvedPath };
      }
      // 处理别名
      if (config.alias) {
        for (const alias in config.alias) {
          if (id.startsWith(alias)) {
            const aliasedPath = path.join(config.alias[alias], id.slice(alias.length));
            return { id: aliasedPath };
          }
        }
      }
      // 如果是第三方包
      let res = tryNodeResolve(id, importer, config);
      if (res) {
        return res;
      }
    },
  };
}

function tryNodeResolve(id, importer, config) {
  const pkgPath = resolve.sync(`${id}/package.json`, { basedir: config.root });
  const pkgDir = path.dirname(pkgPath);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const entryPoint = pkg.module || pkg.main;
  const entryPointPath = path.join(pkgDir, entryPoint);
  return { id: entryPointPath };
}
module.exports = resolvePlugin;
