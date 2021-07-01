var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require("fs"), clc = require("cli-color"), path = require("path"), readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function asyncWriteFile(path, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path, data, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve("finish");
            }
        });
    });
}
// 风格为error-first
function asyncReadFile(path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, function (error, data) {
            if (error) {
                reject([error, null]);
            }
            else {
                resolve([null, data]);
            }
        });
    });
}
// 如果用户已经自己写了index文件且没有选择覆盖，那么就单独生成一个辅助性的映射工具类型文件(typex.ts)
function generateAuxiliaryTypeFile(cmdPath, tempType) {
    var sourceCode = "\n  export function isOwnKey(\n    key: string | number | symbol,\n    object: object\n  ): key is keyof typeof object {\n    return key in object;\n  }\n  \n  export type DealNeverType<T extends object> = {\n    [K in keyof T]: T[K] extends never[]\n    ? any[]\n    : T[K] extends never\n    ? any\n    : T[K];\n  };\n  \n  export type NonNullState<R extends object> = DealNeverType<R>;\n  ";
    // 写入文件
    fs.writeFileSync(path.resolve(cmdPath, tempType === "nuxt" ? "store/typex.ts" : "src/store/typex.ts"), sourceCode);
}
// nuxt的store模板
function getStoreTemplate(mutationTypeName, stateTypeName, style) {
    if (style === void 0) { style = "normal"; }
    var publicTemplate = "\n    function isOwnKey(\n      key: string | number | symbol,\n      object: object\n    ): key is keyof typeof object {\n      return key in object;\n    }\n\n    type DealNeverType<T extends object> = {\n      [K in keyof T]: T[K] extends never[]\n        ? any[]\n        : T[K] extends never\n        ? any\n        : T[K];\n    };\n\n    export type " + stateTypeName + " = DealNeverType<" + (style === "nuxt" ? "ReturnType<typeof state>" : "typeof state") + ">;\n    \n    // \u4E00\u4E2A\u7B80\u5355\u7684\u6A21\u677F \u53EF\u4EE5\u7B80\u5316mutation\uFF0C\u9AD8\u5EA6\u96C6\u6210\u5316\n    export const mutations = {\n      SET_STATE(state: " + stateTypeName + ", obj: Partial<" + stateTypeName + ">) {\n        for (const key in obj) {\n          if (isOwnKey(key, obj)) {\n            state[key] = obj[key];\n          }\n        }\n      }\n    };\n\n    export type " + mutationTypeName + " = typeof mutations;\n  ";
    if (style === "nuxt") {
        return "\n      export const state = () => ({});\n      " + publicTemplate + "\n    ";
    }
    else {
        return "\n      import Vue from 'vue'\n      import Vuex from 'vuex'\n      \n      Vue.use(Vuex)\n      \n      const state = {}\n      " + publicTemplate + "\n      export default new Vuex.Store<" + stateTypeName + ">({\n        state,\n        mutations\n      });\n    ";
    }
}
function getDeclareTemplate(mutationTypeName, stateTypeName) {
    return "\n  import { CommitOptions, Payload, Store } from \"vuex\";\n  import { " + mutationTypeName + ", " + stateTypeName + " } from \"@/store\";\n\n  type TupleTypeToUnions<T, K = any> = T extends Array<K> ? T[number] : T \n\n  // \u79FB\u9664\u6307\u5B9Akey\uFF0C\u53EF\u63A5\u53D7\u5143\u7956\n  type ExcludeKey<T, U> = T extends (U extends Array<any> ? TupleTypeToUnions<U> : U) ? never : T;\n\n  // \u63A8\u65AD\u51FAmutation\u51FD\u6570\u7684\u53C2\u6570\u7C7B\u578B\uFF0C\u4EE5\u5143\u7956\u5F62\u5F0F\u8FD4\u56DE\n  type ParamsType<T extends (...args: any) => any> = T extends (...args: infer R) => any ? R : any;\n\n  // \u79FB\u9664state\u4E0Ecommit\n  type NoCommitStateStore = {\n    [K in ExcludeKey<keyof Store<any>, [\"commit\", \"state\"]>]: Store<any>[K];\n  };\n\n  // \u5C06mutation\u7684\u51FD\u6570\u540D\u4E0E\u51FD\u6570\u7C7B\u578B\u7EC4\u88C5\u6210map\uFF0C\u56E0\u4E3Amutation\u51FD\u6570\u7684\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u503C\uFF0C\u6240\u4EE5\u53EF\u4EE5\u5199\u6B7B[1]\n  type TPayload = {\n    [K in keyof TMutation]: ParamsType<TMutation[K]>[1]\n  }\n\n  // \u63A8\u65AD\u51FA\u6700\u7EC8\u7684\u7C7B\u578B \n  // store.commit<key>(\"key\", xxx)\u8FD9\u6837\u662F\u53EF\u4EE5\u51C6\u786E\u63A8\u65ADxxx\u7684\u7C7B\u578B\uFF0C\u4E0D\u4F20\u8303\u578Bxxx\u4F1A\u662F\u8054\u5408\u7C7B\u578B\n  declare module \"vue/types/vue\" {\n    interface Vue {\n      $store: NoCommitStateStore & {\n        commit: {\n          <R extends keyof " + mutationTypeName + ">(\n            type: keyof " + mutationTypeName + ",\n            payload?: TPayload[R],\n            options?: CommitOptions\n          ): void;\n          <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;\n        };\n      } & {\n        state: " + stateTypeName + ";\n      };\n    }\n  }\n  ";
}
// 去掉多余的
function sourceCodeFilter(code) {
    var codeSplitByLine = code.split("\n"), startIndex = 0, endIndex = 0, braceCount = 0, matchBraceCount = 0;
    for (var i = 0; i < codeSplitByLine.length; i++) {
        var line = codeSplitByLine[i];
        if (/^(declare module "vue\/types\/vue".?)/.test(line.trim())) {
            startIndex = i;
            matchBraceCount += 1;
        }
        else if (line.trim().endsWith("{")) {
            matchBraceCount += 1;
        }
        else if (line.trim() === "}" && matchBraceCount > braceCount) {
            braceCount += 1;
        }
        if (matchBraceCount === braceCount && line.trim() === "}" && startIndex !== 0) {
            endIndex = i;
            codeSplitByLine.splice(startIndex, endIndex - startIndex + 1);
            return codeSplitByLine.join("\n");
        }
    }
    return code;
}
function removeVuexAnyType(cmdPath, mutationTypeName, stateTypeName, savePath) {
    return __awaiter(this, void 0, void 0, function () {
        var vuexTypePath, _a, error, sourceCode, delIndex, writeVuexTypeFile, dealedCode;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    vuexTypePath = path.resolve(cmdPath, "node_modules/vuex/types/vue.d.ts");
                    if (!fs.existsSync(vuexTypePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, asyncReadFile(vuexTypePath)];
                case 1:
                    _a = _b.sent(), error = _a[0], sourceCode = _a[1];
                    if (error) {
                        throw new Error("\u8BFB\u53D6vuex\u58F0\u660E\u6587\u4EF6\u5931\u8D25\uFF1A" + error.message);
                    }
                    else {
                        delIndex = sourceCode.toString().split("\n").findIndex(function (d) { return d.indexOf("vue/types/vue") !== -1; }), writeVuexTypeFile = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                fs.writeFileSync(savePath.endsWith(".d.ts") ? savePath : savePath + ".d.ts", getDeclareTemplate(mutationTypeName, stateTypeName));
                                return [2 /*return*/];
                            });
                        }); };
                        if (delIndex === -1) {
                            writeVuexTypeFile();
                        }
                        else {
                            dealedCode = sourceCodeFilter(sourceCode.toString());
                            !!dealedCode && fs.writeFileSync(vuexTypePath, dealedCode);
                            writeVuexTypeFile();
                        }
                    }
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
// 改为从命令行获取参数
function excute(cmdPath) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            rl.question("Mutation属性的类型的字段名？（默认为TMutation）", function (mutationTypeName) {
                !mutationTypeName && (mutationTypeName = "TMutation");
                rl.question("State属性的类型的字段名？（默认为TState）", function (stateTypeName) {
                    !stateTypeName && (stateTypeName = "TState");
                    rl.question("当前项目框架？（nuxt/normal）", function (tempType) {
                        rl.question("\u58F0\u660E\u6587\u4EF6\u4FDD\u5B58\u7684\u8DEF\u5F84\uFF1F" + (tempType === "nuxt" ? "（vuex-type.d.ts" : "（src/vuex-type.d.ts") + "\uFF0C\u76F8\u5BF9\u8DEF\u5F84\uFF09", function (savePath) {
                            savePath = path.resolve(cmdPath, !!savePath ? savePath : tempType === "nuxt" ? "vuex-type.d.ts" : "src/vuex-type.d.ts");
                            var storePath = path.resolve(cmdPath, tempType === "nuxt" ? "store/index.ts" : "src/store/index.ts");
                            var doInit = function (generateStore) {
                                if (generateStore === void 0) { generateStore = true; }
                                return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!generateStore) return [3 /*break*/, 2];
                                                return [4 /*yield*/, asyncWriteFile(storePath, getStoreTemplate(mutationTypeName, stateTypeName, tempType))];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2: return [4 /*yield*/, removeVuexAnyType(cmdPath, mutationTypeName, stateTypeName, savePath)];
                                            case 3:
                                                _a.sent();
                                                console.log(clc.blue('┍------------------------------------------------------------------┑'));
                                                console.log("⚡️                                                                 ⚡️");
                                                console.log(clc.blue('⚡️          🚀🚀🚀=============操作成功=============🚀🚀🚀         ⚡️'));
                                                console.log("⚡️                                                                 ⚡️");
                                                console.log(clc.blue('┕------------------------------------------------------------------┙'));
                                                process.exit();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            };
                            rl.question("是否自动生成store模板文件？（若选择no你需要自己编写类型并进行导出！）（yes/no）", function (answer) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    if (answer === "yes") {
                                        // 这里再次提示用户
                                        if (fs.existsSync(storePath)) {
                                            rl.question("当前已创建vuex配置文件，是否覆盖？（yes/no）", function (createAnswer) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (createAnswer === "yes") {
                                                        doInit();
                                                    }
                                                    else {
                                                        generateAuxiliaryTypeFile(cmdPath, tempType);
                                                        doInit(false);
                                                    }
                                                    return [2 /*return*/];
                                                });
                                            }); });
                                        }
                                        else {
                                            doInit();
                                        }
                                    }
                                    else {
                                        generateAuxiliaryTypeFile(cmdPath, tempType);
                                        doInit(false);
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
                        });
                    });
                });
            });
            return [2 /*return*/];
        });
    });
}
function excuteWithConfig(cmdPath, _a) {
    var stateTypeName = _a.stateTypeName, mutationTypeName = _a.mutationTypeName, declareFilePath = _a.declareFilePath, declareFileName = _a.declareFileName, templateStyle = _a.templateStyle, needTemplate = _a.needTemplate;
    return __awaiter(this, void 0, void 0, function () {
        var storePath, doInit;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    storePath = path.resolve(cmdPath, templateStyle === "nuxt" ? "store/index.ts" : "src/store/index.ts");
                    doInit = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, asyncWriteFile(storePath, getStoreTemplate(mutationTypeName, stateTypeName, templateStyle))];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, removeVuexAnyType(cmdPath, mutationTypeName, stateTypeName, path.resolve(cmdPath, !declareFilePath ? declareFileName : declareFilePath + "/" + declareFileName))];
                                case 2:
                                    _a.sent();
                                    console.log(clc.blue('┍------------------------------------------------------------------┑'));
                                    console.log("⚡️                                                                 ⚡️");
                                    console.log(clc.blue('⚡️          🚀🚀🚀=============操作成功=============🚀🚀🚀         ⚡️'));
                                    console.log("⚡️                                                                 ⚡️");
                                    console.log(clc.blue('┕------------------------------------------------------------------┙'));
                                    process.exit();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    if (!needTemplate) return [3 /*break*/, 1];
                    if (fs.existsSync(storePath)) {
                        rl.question("当前已创建vuex配置文件，是否覆盖？（yes/no）", function (createAnswer) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (createAnswer === "yes") {
                                    doInit();
                                }
                                else {
                                    console.log(clc.red("💔💔💔--------->本次操作已取消<----------💔💔💔"));
                                    process.exit();
                                }
                                return [2 /*return*/];
                            });
                        }); });
                    }
                    else {
                        doInit();
                    }
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, removeVuexAnyType(cmdPath, mutationTypeName, stateTypeName, path.resolve(cmdPath, declareFilePath + "/" + declareFileName))];
                case 2:
                    _b.sent();
                    console.log(clc.blue('┍------------------------------------------------------------------┑'));
                    console.log("⚡️                                                                 ⚡️");
                    console.log(clc.blue('⚡️          🚀🚀🚀=============操作成功=============🚀🚀🚀         ⚡️'));
                    console.log("⚡️                                                                 ⚡️");
                    console.log(clc.blue('┕------------------------------------------------------------------┙'));
                    process.exit();
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
module.exports = {
    excute: excute,
    excuteWithConfig: excuteWithConfig,
    asyncReadFile: asyncReadFile,
    asyncWriteFile: asyncWriteFile
};
