const fs = require("fs"),
  clc = require("cli-color"),
  path = require("path"),
  readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function asyncWriteFile(path: string, data: string | NodeJS.ArrayBufferView): Promise<"finish" | NodeJS.ErrnoException> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve("finish");
      }
    });
  });
}

// 风格为error-first
function asyncReadFile(path: string): Promise<[NodeJS.ErrnoException, null] | [null, Buffer]> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function (error, data) {
      if (error) {
        reject([error, null]);
      } else {
        resolve([null, data]);
      }
    });
  });
}

function getDeclareTemplate(): string {
  return `
import { CommitOptions, DispatchOptions, Payload, Store } from "vuex";
import { TAction, TMutation, TState } from "@/store";

type TupleTypeToUnions<T, K = any> = T extends Array<K> ? T[number] : T

// 移除指定key，可接受元祖 remove U in T accept tuple
type ExcludeKey<T, U> = T extends (U extends Array<any> ? TupleTypeToUnions<U> : U) ? never : T;

// 移除state与commit、dispatch 方便后续重写 
type CutStore = {
  [K in ExcludeKey<keyof Store<any>, ["state", "commit", "dispatch"]>]: Store<any>[K];
};

declare module "vue/types/vue" {
  interface Vue {
    $store: CutStore & {
      commit: {
        <R extends keyof TMutation>(
          type: R,
          payload?: TMutation[R],
          options?: CommitOptions
        ): void;
        <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;
      };
    } & {
      dispatch: {
        <R extends keyof TAction>(
          type: R,
          payload?: TAction[R],
          options?: DispatchOptions
        ): void;
        <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<any>;
      }
    } & {
      state: TState;
    };
  }
}

declare module "vuex/types/index" {
  interface Commit {
    <K extends keyof TMutation>(
      type: K,
      payload?: TMutation[K],
      options?: CommitOptions
    ): void;
  }

  interface Dispatch {
    <K extends keyof TAction>(
      type: K,
      payload?: TAction[K],
      options?: DispatchOptions
    ): Promise<any>;
  }
}
  `;
}

// 去掉多余的
function sourceCodeFilter(code: string): string {
  let codeSplitByLine: string[] = code.split("\n"),
    startIndex = 0, endIndex = 0, braceCount = 0, matchBraceCount = 0;

  for(let i = 0; i < codeSplitByLine.length; i++) {
    const line = codeSplitByLine[i];
    if(/^(declare module "vue\/types\/vue".?)/.test(line.trim())) {
      startIndex = i;
      matchBraceCount += 1;
    } else if(line.trim().endsWith("{")) {
      matchBraceCount += 1;
    } else if(line.trim() === "}" && matchBraceCount > braceCount) {
      braceCount += 1;
    } 
    if(matchBraceCount === braceCount && line.trim() === "}" && startIndex !== 0) {
      endIndex = i;
      codeSplitByLine.splice(startIndex, endIndex - startIndex + 1);
      return codeSplitByLine.join("\n");
    }
  }

  return code;
}

async function removeVuexAnyType(cmdPath: string, savePath: string) {
  const vuexTypePath = path.resolve(cmdPath, "node_modules/vuex/types/vue.d.ts");
  if (fs.existsSync(vuexTypePath)) {
    const [error, sourceCode] = await asyncReadFile(vuexTypePath);
    if (error) {
      throw new Error(`读取vuex声明文件失败：${error.message}`);
    } else {
      const delIndex = sourceCode.toString().split("\n").findIndex(d => d.indexOf("vue/types/vue") !== -1),
        writeVuexTypeFile = async () => {
          fs.writeFileSync(savePath.endsWith(".d.ts") ? savePath : `${savePath}.d.ts`, getDeclareTemplate());
          // const result = await asyncWriteFile(savePath.endsWith(".d.ts") ? savePath : `${savePath}.d.ts`, getDeclareTemplate(mutationTypeName, stateTypeName));
          // if(result !== "finish") {
          //   console.log(`生成vuex-type声明时出错：${result.message}`)
          // } 
        }
      if (delIndex === -1) {
        writeVuexTypeFile();
      } else {
        const dealedCode = sourceCodeFilter(sourceCode.toString());
        !!dealedCode && fs.writeFileSync(vuexTypePath, dealedCode);
        writeVuexTypeFile();
      }
    }
  }
}

// 改为从命令行获取参数
async function excute(cmdPath: string) {
  rl.question("当前项目框架？（nuxt/normal）", (tempType: "nuxt" | "normal") => {
    rl.question(`声明文件保存的路径？${tempType === "nuxt" ? "（vuex-type.d.ts" : "（src/vuex-type.d.ts"}，相对路径）`, async (savePath: string) => {
      savePath = path.resolve(cmdPath, !!savePath ? savePath : tempType === "nuxt" ? "vuex-type.d.ts" : "src/vuex-type.d.ts");
      await removeVuexAnyType(cmdPath, savePath);
      console.log(
        clc.blue('┍------------------------------------------------------------------┑')
      );
      console.log("⚡️                                                                 ⚡️");
      console.log(clc.blue('⚡️          🚀🚀🚀=============操作成功=============🚀🚀🚀         ⚡️'));
      console.log("⚡️                                                                 ⚡️");
      console.log(
        clc.blue('┕------------------------------------------------------------------┙')
      );
      process.exit();
    });
  });
}

async function excuteWithConfig(
  cmdPath: string,
  { declareFilePath, declareFileName, templateStyle }: IConfigJSON
) {
  const storePath = path.resolve(cmdPath, templateStyle === "nuxt" ? "store/index.ts" : "src/store/index.ts");
  await removeVuexAnyType(cmdPath, path.resolve(cmdPath, `${declareFilePath}/${declareFileName}`));
  console.log(
    clc.blue('┍------------------------------------------------------------------┑')
  );
  console.log("⚡️                                                                 ⚡️");
  console.log(clc.blue('⚡️          🚀🚀🚀=============操作成功=============🚀🚀🚀         ⚡️'));
  console.log("⚡️                                                                 ⚡️");
  console.log(
    clc.blue('┕------------------------------------------------------------------┙')
  );
  process.exit();
}

module.exports = {
  excute,
  excuteWithConfig,
  asyncReadFile,
  asyncWriteFile
}