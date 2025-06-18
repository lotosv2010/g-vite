const scanImports = require("./scan");
const fs = require("fs-extra");
const path = require("path");
const { build } = require("esbuild");
const { normalizePath } = require("../utils");

/**
 * 分析项目依赖的第三方模块
 * @param {object} config 配置项
 */
async function createOptimizeDepsRun(config) {
  // 扫描依赖
  const deps = await scanImports(config);
  // 缓存目录
  const { cacheDir } = config;
  // 缓存依赖的目录
  const depsCacheDir = path.resolve(cacheDir, "deps");
  // 缓存依赖的元数据目录
  const metadataPath = path.join(depsCacheDir, "_metadata.json");
  // 缓存依赖的元数据缓存
  const metadata = {
    optimized: {},
  };
  //遍历依赖
  for (const id in deps) {
    // 依赖的入口文件
    const entry = deps[id];
    // 缓存依赖的文件名
    const file = normalizePath(path.resolve(depsCacheDir, id + ".js"));
    // 缓存依赖
    metadata.optimized[id] = {
      file,
      src: entry,
    };
    // 预编译
    await build({
      absWorkingDir: process.cwd(),
      entryPoints: [deps[id]],
      outfile: file,
      bundle: true,
      write: true,
      format: "esm",
    });
  }
  // 确保缓存目录存在
  await fs.ensureDir(depsCacheDir);
  // ! 把它们的es module版本进行打包，存放在`node modules/.g-vite/deps`
  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      metadata,
      (key, value) => {
        if (key === "file" || key === "src") {
          // optimized里存的是绝对路径，此处写入硬盘的是相对于缓存目录的相对路径
          return normalizePath(path.relative(depsCacheDir, value));
        }
        return value;
      },
      2
    )
  );
  return { metadata };
}

exports.createOptimizeDepsRun = createOptimizeDepsRun;
