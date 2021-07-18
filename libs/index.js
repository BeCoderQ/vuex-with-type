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
function getDeclareTemplate() {
    return "\nimport { CommitOptions, DispatchOptions, Payload, Store } from \"vuex\";\nimport { TAction, TMutation, TState } from \"@/store\";\n\ntype TupleTypeToUnions<T, K = any> = T extends Array<K> ? T[number] : T\n\n// \u79FB\u9664\u6307\u5B9Akey\uFF0C\u53EF\u63A5\u53D7\u5143\u7956 remove U in T accept tuple\ntype ExcludeKey<T, U> = T extends (U extends Array<any> ? TupleTypeToUnions<U> : U) ? never : T;\n\n// \u79FB\u9664state\u4E0Ecommit\u3001dispatch \u65B9\u4FBF\u540E\u7EED\u91CD\u5199 \ntype CutStore = {\n  [K in ExcludeKey<keyof Store<any>, [\"state\", \"commit\", \"dispatch\"]>]: Store<any>[K];\n};\n\ndeclare module \"vue/types/vue\" {\n  interface Vue {\n    $store: CutStore & {\n      commit: {\n        <R extends keyof TMutation>(\n          type: R,\n          payload?: TMutation[R],\n          options?: CommitOptions\n        ): void;\n        <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;\n      };\n    } & {\n      dispatch: {\n        <R extends keyof TAction>(\n          type: R,\n          payload?: TAction[R],\n          options?: DispatchOptions\n        ): void;\n        <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<any>;\n      }\n    } & {\n      state: TState;\n    };\n  }\n}\n\ndeclare module \"vuex/types/index\" {\n  interface Commit {\n    <K extends keyof TMutation>(\n      type: K,\n      payload?: TMutation[K],\n      options?: CommitOptions\n    ): void;\n  }\n\n  interface Dispatch {\n    <K extends keyof TAction>(\n      type: K,\n      payload?: TAction[K],\n      options?: DispatchOptions\n    ): Promise<any>;\n  }\n}\n  ";
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
function removeVuexAnyType(cmdPath, savePath) {
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
                                fs.writeFileSync(savePath.endsWith(".d.ts") ? savePath : savePath + ".d.ts", getDeclareTemplate());
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
            rl.question("当前项目框架？（nuxt/normal）", function (tempType) {
                rl.question("\u58F0\u660E\u6587\u4EF6\u4FDD\u5B58\u7684\u8DEF\u5F84\uFF1F" + (tempType === "nuxt" ? "（vuex-type.d.ts" : "（src/vuex-type.d.ts") + "\uFF0C\u76F8\u5BF9\u8DEF\u5F84\uFF09", function (savePath) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                savePath = path.resolve(cmdPath, !!savePath ? savePath : tempType === "nuxt" ? "vuex-type.d.ts" : "src/vuex-type.d.ts");
                                return [4 /*yield*/, removeVuexAnyType(cmdPath, savePath)];
                            case 1:
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
                }); });
            });
            return [2 /*return*/];
        });
    });
}
function excuteWithConfig(cmdPath, _a) {
    var declareFilePath = _a.declareFilePath, declareFileName = _a.declareFileName, templateStyle = _a.templateStyle;
    return __awaiter(this, void 0, void 0, function () {
        var storePath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    storePath = path.resolve(cmdPath, templateStyle === "nuxt" ? "store/index.ts" : "src/store/index.ts");
                    return [4 /*yield*/, removeVuexAnyType(cmdPath, path.resolve(cmdPath, declareFilePath + "/" + declareFileName))];
                case 1:
                    _b.sent();
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
}
module.exports = {
    excute: excute,
    excuteWithConfig: excuteWithConfig,
    asyncReadFile: asyncReadFile,
    asyncWriteFile: asyncWriteFile
};
