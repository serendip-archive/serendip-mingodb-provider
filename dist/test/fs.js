"use strict";
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
exports.__esModule = true;
var assert = require("assert");
var fs = require("fs-extra");
var MingodbProvider_1 = require("../MingodbProvider");
describe("gridfs scenarios", function () {
    var provider;
    var collection;
    beforeEach(function (done) {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // runs before each test in this block
                        provider = new MingodbProvider_1.MingodbProvider();
                        return [4 /*yield*/, provider.initiate({
                                MingoDb: process.env["db.MingoDb"],
                                mongoUrl: process.env["db.mongoUrl"],
                                authSource: process.env["db.authSource"],
                                user: process.env["db.user"],
                                password: process.env["db.password"]
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, provider.dropCollection("fs.files")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, provider.dropCollection("fs.chunks")];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, provider.collection("fs.files")];
                    case 7:
                        collection = _a.sent();
                        done();
                        return [2 /*return*/];
                }
            });
        }); })();
    });
    it("should upload", function (done) {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var uploadStream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, provider.openUploadStreamByFilePath("package.json", {})];
                    case 1:
                        uploadStream = _a.sent();
                        fs.createReadStream("package.json").pipe(uploadStream);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                uploadStream.on("finish", function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var downloadStream, data;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, provider.openDownloadStreamByFilePath("package.json")];
                                            case 1:
                                                downloadStream = _a.sent();
                                                data = "";
                                                downloadStream.on("data", function (chunk) {
                                                    data += chunk;
                                                });
                                                downloadStream.on("end", function () {
                                                    assert.equal(fs.readFileSync("package.json").toString(), data);
                                                    resolve();
                                                });
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            })];
                }
            });
        }); })()
            .then(done)["catch"](done);
    }).timeout(1000);
    it("upload should overwrite on same path with different streams", function (done) {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (i) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                                            var uploadStream;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, provider.openUploadStreamByFilePath("test", {})];
                                                    case 1:
                                                        uploadStream = _a.sent();
                                                        uploadStream.write(i.toString());
                                                        uploadStream.end();
                                                        uploadStream.on("finish", resolve);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 3)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                            var downloadStream, data;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, provider.openDownloadStreamByFilePath("test")];
                                    case 1:
                                        downloadStream = _a.sent();
                                        data = "";
                                        downloadStream.on("data", function (chunk) {
                                            data += chunk;
                                        });
                                        downloadStream.on("end", function () {
                                            assert.equal("2", data);
                                            resolve();
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                }
            });
        }); })()
            .then(done)["catch"](done);
    }).timeout(1000);
});
