const importAnalysisPlugin = require("./importAnalysis");
const preAliasPlugin = require("./preAlias");
const resolvePlugin = require("./resolve");
const definePlugin = require("./define");

/**
 * 获取插件
 */
async function resolvePlugins(config, userPlugins) {
  // 此处返回的是内部的插件
  return [
    preAliasPlugin(config), // 吧 vue 映射成 vue.js
    resolvePlugin(config),
    ...userPlugins,
    definePlugin(config),
    importAnalysisPlugin(config),
  ];
}

exports.resolvePlugins = resolvePlugins;
