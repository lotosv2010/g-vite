const MagicString = require("magic-string");

/**
 * @description: 替换代码中的 define
 * @param {object} 配置项
 * @return {object} 插件对象
 */
function definePlugin(config) {
  return {
    name: "g-vite:define",
    transform(code) {
      // 获取 define 配置项
      const replacements = config.define || {};
      // 获取 define 配置项的 key
      const replacementsKeys = Object.keys(replacements);
      // 创建正则
      const pattern = new RegExp(
        "(" + replacementsKeys.map((str) => str).join("|") + ")",
        "g"
      );
      // 创建 MagicString 对象
      const s = new MagicString(code);
      // 是否有替换
      let hasReplaced = false;
      // 是否匹配
      let match;
      // 循环匹配
      while ((match = pattern.exec(code))) {
        // 标记为已替换
        hasReplaced = true;
        // 获取匹配的字符串开始索引
        const start = match.index;
        // 获取匹配的结束索引
        const end = start + match[0].length;
        // 替换匹配的字符串
        const replacement = "" + replacements[match[1]];
        // 替换字符串
        s.overwrite(start, end, replacement);
      }
      if (!hasReplaced) {
        return null;
      }
      return { code: s.toString() };
    },
  };
}
module.exports = definePlugin;
