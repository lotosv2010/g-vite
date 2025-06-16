const importAnalysisPlugin = require("./importAnalysis");
const preAliasPlugin = require("./preAlias");
const resolvePlugin = require("./resolve");

/**
 * 获取插件
 */
async function resolvePlugins(config) {
  // 此处返回的是内部的插件
  return [
    preAliasPlugin(config), // 吧 vue 映射成 vue.js
    resolvePlugin(config),
    importAnalysisPlugin(config),
  ];
}

exports.resolvePlugins = resolvePlugins;
