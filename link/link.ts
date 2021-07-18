#!/usr/bin/env node
const yargs = require("yargs"),
  path = require("path"),
  fs = require("fs"),
  { excute, excuteWithConfig, asyncReadFile, asyncWriteFile } = require("../libs/index");

async function getConfigAndExcute(filePath: string) {
  if(fs.existsSync(filePath)) {
    const [error, buffer] = await asyncReadFile(filePath);
    if(error) throw new Error(`读取配置文件出错：${error.message}`);
    // 配置文件序列化
    try {
      const configJSON: IConfigJSON = JSON.parse(buffer.toString());
      excuteWithConfig(process.cwd(), {
        ...configJSON
      });
    } catch(err) {
      throw new TypeError(`配置文件序列化失败：${err}`);
    }
  }
}  

(async function run() {
  // 依赖地址
  const depPath = path.resolve(process.cwd(), "node_modules");
  // 配置文件地址
  const configFilePath = path.resolve(process.cwd(), "vue-with-type.json");
  const { _ } = yargs.argv,
    [cmd] = _;

  switch(cmd) {
    case "init": 
      if(fs.existsSync(depPath)) {
        if(fs.existsSync(configFilePath)) {
          getConfigAndExcute(configFilePath);
        } else {
          excute(process.cwd());
        }
      } else {
        console.log("请在项目根目录执行命令");
        process.exit();
      }
      break;
    case "config":
      const defaultConfig = `{
        "declareFileName": "vuex-type.d.ts",\n
        "declareFilePath": "src",\n
        "templateStyle": "normal"
      }`;
      const result = await asyncWriteFile(configFilePath, defaultConfig);
      if(result === "finish") {
        console.log("配置文件初始化完毕！");
        process.exit();
      } else {
        console.log(`生成配置文件出错：${result.message}`);
      }
      break;
    case "handbook":
      console.log("vwt handbook: 查看所有选项参数");
      console.log("vwt init: 生成代码");  
      console.log("vwt config: 生成配置文件");  
      process.exit();
      break;
    default: 
      console.log("请输入'vwt init'进行初始化");
      process.exit();
  }  
})();
