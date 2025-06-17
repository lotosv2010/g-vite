const {
  parse,
  compileScript,
  rewriteDefault,
  compileTemplate,
  compileStyleAsync,
} = require("vue/compiler-sfc");
const fs = require("fs");
const path = require("path");
const hash = require("hash-sum");

// 缓存
const descriptorCache = new Map();

/**
 * 插件
 */
function vue() {
  let root;
  return {
    name: "vue", // 插件名称
    // 配置
    config(config) {
      root = config.root;
      return {
        define: {
          __VUE_OPTIONS_API__: true, // 是否使用 options api
          __VUE_PROD_DEVTOOLS__: false, // 是否使用 devtools
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false, // 是否使用生产环境 mismatch details
        }
      }
    },
    // 加载
    async load(id) {
      // 获取文件名
      const { filename, query } = parseVueRequest(id);
      // 如果是vue文件
      if (query.has("vue")) {
        // 获取描述
        const descriptor = await getDescriptor(filename, root);
        // 如果是style
        if (query.get("type") === "style") {
          // 获取样式
          let block = descriptor.styles[Number(query.get("index"))];
          // 如果有样式
          if (block) {
            // 返回样式
            return { code: block.content };
          }
        }
      }
    },
    // 转换
    async transform(code, id) {
      // 获取文件名
      const { filename, query } = parseVueRequest(id);
      // 如果是vue文件
      if (filename.endsWith(".vue")) {
        // 如果是style
        if (query.get("type") === "style") {
          // 获取描述
          const descriptor = await getDescriptor(filename, root);
          // 转换样式
          let result = await transformStyle(
            code,
            descriptor,
            query.get("index")
          );
          return result;
        } else { // 如果是js
          // 转换js
          let result = await transformMain(code, filename, root);
          return result;
        }
      }
      return null;
    },
  };
}

/**
 * 样式转换
 */
async function transformStyle(code, descriptor, index) {
  const block = descriptor.styles[index];
  //如果是CSS，其实翻译之后和翻译之前内容是一样的
  const result = await compileStyleAsync({
    filename: descriptor.filename,
    source: code,
    id: `data-v-${descriptor.id}`, //必须传递，不然报错
    scoped: block.scoped,
  });
  let styleCode = result.code;
  const injectCode =
    `\nvar  style = document.createElement('style');` +
    `\nstyle.innerHTML = ${JSON.stringify(styleCode)};` +
    `\ndocument.head.appendChild(style);`;
  return {
    code: injectCode,
  };
}

/**
 * 获取描述
 */
async function getDescriptor(filename, root) {
  // 缓存
  let descriptor = descriptorCache.get(filename);
  // 如果缓存有，直接返回
  if (descriptor) return descriptor;
  // 获取文件内容
  const content = await fs.promises.readFile(filename, "utf8");
  // 解析
  const result = parse(content, { filename });
  // 赋值
  descriptor = result.descriptor;
  // 生成id
  descriptor.id = hash(path.relative(root, filename));
  // 设置缓存
  descriptorCache.set(filename, descriptor);
  return descriptor;
}

/**
 * 转换主文件
 */
async function transformMain(source, filename, root) {
  // 获取描述
  const descriptor = await getDescriptor(filename, root);
  // 脚本代码
  const scriptCode = genScriptCode(descriptor, filename);
  // 模板代码
  const templateCode = genTemplateCode(descriptor, filename);
  // 样式代码
  const stylesCode = genStyleCode(descriptor, filename);
  // 拼接代码
  let resolvedCode = [
    stylesCode,
    templateCode,
    scriptCode,
    `_sfc_main['render'] = render`,
    `export default _sfc_main`,
  ].join("\n");
  return { code: resolvedCode };
}

/**
 * 生成样式代码
 */
function genStyleCode(descriptor, filename) {
  let styleCode = "";
  // 如果有样式
  if (descriptor.styles.length) {
    // 遍历样式
    descriptor.styles.forEach((style, index) => {
      // 生成请求
      const query = `?vue&type=style&index=${index}&lang=css`;
      // 优化请求
      const styleRequest = (filename + query).replace(/\\/g, "/");
      // 生成导入
      styleCode += `\nimport ${JSON.stringify(styleRequest)}`;
    });
    return styleCode;
  }
}

/**
 * 生成脚本代码
 */
function genScriptCode(descriptor, id) {
  let scriptCode = "";
  // 获取脚本
  let script = compileScript(descriptor, { id });
  if (!script.lang) {
    // 获取脚本内容
    scriptCode = rewriteDefault(script.content, "_sfc_main");
  }
  return scriptCode;
}

/**
 * 模板代码
 */
function genTemplateCode(descriptor, id) {
  // 获取模板
  let content = descriptor.template.content;
  // 编译模板
  const result = compileTemplate({ source: content, id });
  return result.code;
}

/**
 * 解析请求
 */
function parseVueRequest(id) {
  // 获取文件名
  const [filename, querystring = ""] = id.split("?");
  // 创建一个 URLSearchParams 对象
  let query = new URLSearchParams(querystring);
  return {
    filename,
    query,
  };
}
module.exports = vue;
