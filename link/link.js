#!/usr/bin/env node
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var yargs = require("yargs"), path = require("path"), fs = require("fs"), _a = require("../index"), excute = _a.excute, excuteWithConfig = _a.excuteWithConfig, asyncReadFile = _a.asyncReadFile, asyncWriteFile = _a.asyncWriteFile;
function getConfigAndExcute(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, error, buffer, configJSON;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fs.existsSync(filePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, asyncReadFile(filePath)];
                case 1:
                    _a = _b.sent(), error = _a[0], buffer = _a[1];
                    if (error)
                        throw new Error("\u8BFB\u53D6\u914D\u7F6E\u6587\u4EF6\u51FA\u9519\uFF1A" + error.message);
                    // 配置文件序列化
                    try {
                        configJSON = JSON.parse(buffer.toString());
                        excuteWithConfig(process.cwd(), __assign({}, configJSON));
                    }
                    catch (err) {
                        throw new TypeError("\u914D\u7F6E\u6587\u4EF6\u5E8F\u5217\u5316\u5931\u8D25\uFF1A" + err);
                    }
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
(function run() {
    return __awaiter(this, void 0, void 0, function () {
        var depPath, configFilePath, _, cmd, _a, defaultConfig, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    depPath = path.resolve(process.cwd(), "node_modules");
                    configFilePath = path.resolve(process.cwd(), "vue-with-type.json");
                    _ = yargs.argv._, cmd = _[0];
                    _a = cmd;
                    switch (_a) {
                        case "init": return [3 /*break*/, 1];
                        case "config": return [3 /*break*/, 2];
                        case "handbook": return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 5];
                case 1:
                    if (fs.existsSync(depPath)) {
                        if (fs.existsSync(configFilePath)) {
                            getConfigAndExcute(configFilePath);
                        }
                        else {
                            excute(process.cwd());
                        }
                    }
                    else {
                        console.log("请在项目根目录执行命令");
                        process.exit();
                    }
                    return [3 /*break*/, 6];
                case 2:
                    defaultConfig = "{\n        \"mutationTypeName\": \"TMutation\",\n\n        \"stateTypeName\": \"TState\",\n\n        \"declareFileName\": \"vuex-type.d.ts\",\n\n        \"declareFilePath\": \"src\",\n\n        \"needTemplate\": true,\n\n        \"templateStyle\": \"normal\"\n      }";
                    return [4 /*yield*/, asyncWriteFile(configFilePath, defaultConfig)];
                case 3:
                    result = _b.sent();
                    if (result === "finish") {
                        console.log("配置文件初始化完毕！");
                        process.exit();
                    }
                    else {
                        console.log("\u751F\u6210\u914D\u7F6E\u6587\u4EF6\u51FA\u9519\uFF1A" + result.message);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    console.log("vwt handbook: 查看所有选项参数");
                    console.log("vwt init: 生成代码");
                    console.log("vwt config: 生成配置文件");
                    process.exit();
                    return [3 /*break*/, 6];
                case 5:
                    console.log("请输入'vwt init'进行初始化");
                    process.exit();
                    _b.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
})();
