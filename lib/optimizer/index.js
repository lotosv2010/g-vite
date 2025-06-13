const scanImports = require("./scan");

/**
 * 创建优化依赖任务
 * @param {object} config 配置项
 */
async function createOptimizeDepsRun(config) {
  const deps = await scanImports(config); // 扫描依赖，返回依赖对象
  console.log('createOptimizeDepsRun', deps);
  
}

exports.createOptimizeDepsRun = createOptimizeDepsRun;