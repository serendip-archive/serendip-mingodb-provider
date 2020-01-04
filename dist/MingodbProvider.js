"use strict";
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
exports.__esModule = true;
var events_1 = require("events");
var fs = require("fs-extra");
var minimongo_1 = require("minimongo");
var path = require("path");
var MingodbCollection_1 = require("./MingodbCollection");
var glob = require("fast-glob");
var MingodbProvider = /** @class */ (function () {
    function MingodbProvider() {
        // you can listen for  any "update","delete","insert" event. each event emitter is accessible trough property named same as collectionName
        this.events = {};
        this._collections = {};
    }
    MingodbProvider.prototype.dropDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.unlink(this.dbPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.initiate(this.options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MingodbProvider.prototype.dropCollection = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fs.emptyDir(path.join(this.dbPath, name))];
                                case 1:
                                    _a.sent();
                                    this.db.removeCollection(name, function () { return resolve(true); }, function (err) { return reject(err); });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    MingodbProvider.prototype.collections = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.getCollectionNames()];
            });
        });
    };
    MingodbProvider.prototype.deletePath = function (_path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!_path.startsWith('/')) {
                            _path = path.join(this.fsPath, _path);
                        }
                        return [4 /*yield*/, fs.stat(_path)];
                    case 1:
                        if (!(_a.sent()).isFile()) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.remove(_path)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, fs.emptyDir(_path)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, fs.rmdir(_path)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    MingodbProvider.prototype.openUploadStreamByFilePath = function (filePath, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!filePath.startsWith('/')) {
                            filePath = path.join(this.fsPath, filePath);
                        }
                        return [4 /*yield*/, fs.remove(filePath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, fs.createWriteStream(filePath, {})];
                }
            });
        });
    };
    MingodbProvider.prototype.openDownloadStreamByFilePath = function (filePath, opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!filePath.startsWith('/')) {
                    filePath = path.join(this.fsPath, filePath);
                }
                return [2 /*return*/, fs.createReadStream(filePath, {})];
            });
        });
    };
    MingodbProvider.prototype.stats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            db: 'mingodb'
                        };
                        return [4 /*yield*/, this.collections()];
                    case 1:
                        _a.collections = (_b.sent()).length,
                            _a.indexes = null,
                            _a.avgObjSizeByte = null;
                        return [4 /*yield*/, glob(path.join(this.dbPath, './**/*.json'))];
                    case 2: return [2 /*return*/, (_a.objects = (_b.sent()).length,
                            _a.fsUsedMB = null,
                            _a.fsTotalMB = null,
                            _a.storageMB = null,
                            _a)];
                }
            });
        });
    };
    MingodbProvider.prototype.collection = function (collectionName, track) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionPath, collectionPath_1, jsonFiles, _loop_1, _i, jsonFiles_1, jsonFile;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collectionName = collectionName.trim();
                        collectionPath = path.join(this.dbPath, collectionName);
                        return [4 /*yield*/, fs.ensureDir(collectionPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collections()];
                    case 2:
                        if (!((_a.sent()).indexOf(collectionName) === -1)) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.db.addCollection(collectionName, function () { return resolve(); }, function (err) { return reject(err); });
                            })];
                    case 3:
                        _a.sent();
                        collectionPath_1 = path.join(this.dbPath, collectionName);
                        return [4 /*yield*/, fs.readdir(collectionPath_1)];
                    case 4:
                        jsonFiles = _a.sent();
                        _loop_1 = function (jsonFile) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                            var _a, _b;
                                            return __generator(this, function (_c) {
                                                switch (_c.label) {
                                                    case 0:
                                                        _b = (_a = this.db.collections[collectionName]).upsert;
                                                        return [4 /*yield*/, fs.readJson(path.join(collectionPath_1, jsonFile))];
                                                    case 1:
                                                        _b.apply(_a, [_c.sent(),
                                                            function () { return resolve(); },
                                                            function (err) { return reject(err); }]);
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
                        _i = 0, jsonFiles_1 = jsonFiles;
                        _a.label = 5;
                    case 5:
                        if (!(_i < jsonFiles_1.length)) return [3 /*break*/, 8];
                        jsonFile = jsonFiles_1[_i];
                        return [5 /*yield**/, _loop_1(jsonFile)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!this.events[collectionName])
                            this.events[collectionName] = new events_1.EventEmitter();
                        if (!this._collections[collectionName])
                            this._collections[collectionName] = new MingodbCollection_1.MingodbCollection(this.db.collections[collectionName], track, this, collectionName);
                        return [2 /*return*/, this._collections[collectionName]];
                }
            });
        });
    };
    MingodbProvider.prototype.initiate = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultOptions, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        defaultOptions = {
                            mingoPath: "./mingo"
                        };
                        this.options = __assign(__assign({}, defaultOptions), _options);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        this.db = new minimongo_1.MemoryDb();
                        return [4 /*yield*/, fs.ensureDir(this.options.mingoPath)];
                    case 2:
                        _b.sent();
                        this.dbPath = path.join(this.options.mingoPath, "db");
                        this.fsPath = path.join(this.options.mingoPath, "fs");
                        return [4 /*yield*/, fs.ensureDir(this.dbPath)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, fs.ensureDir(this.fsPath)];
                    case 4:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.collection("EntityChanges", false)];
                    case 5:
                        _a.changes = _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        throw new Error("\n\nUnable to initiate to MiniMongo. Error details: \n" + error_1.message);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MingodbProvider;
}());
exports.MingodbProvider = MingodbProvider;
