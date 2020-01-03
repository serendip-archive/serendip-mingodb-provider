"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var serendip_business_model_1 = require("serendip-business-model");
var fast_json_patch_1 = require("fast-json-patch");
var bson_objectid_1 = require("bson-objectid");
var Mingo = require("mingo");
var mingo = Mingo;
var MingodbCollection = /** @class */ (function () {
    function MingodbCollection(collection, track, provider, collectionName) {
        this.collection = collection;
        this.track = track;
        this.provider = provider;
        this.collectionName = collectionName;
    }
    MingodbCollection.prototype.ensureIndex = function (fieldOrSpec, options) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    MingodbCollection.prototype.aggregate = function (pipeline, options) {
        return [];
    };
    MingodbCollection.prototype.find = function (query, skip, limit) {
        var _this = this;
        if (skip)
            skip = parseInt(skip);
        if (limit)
            limit = parseInt(limit);
        return new Promise(function (resolve, reject) {
            _this.collection.find({}).fetch(function (results) {
                resolve(mingo
                    .find(results, query)
                    .skip(skip)
                    .limit(limit)
                    .all());
            }, function (err) { return reject(err); });
        });
    };
    MingodbCollection.prototype.count = function (query) {
        var _this = this;
        if (query && query._id) {
            query._id = new bson_objectid_1["default"](query._id);
        }
        return new Promise(function (resolve, reject) {
            _this.collection.find(query).fetch(function (items) { return resolve(items.length); }, function (err) { return reject(err); });
        });
    };
    MingodbCollection.prototype.updateOne = function (model, userId, trackOptions, isFromInsertOne) {
        var _this = this;
        if (!trackOptions)
            trackOptions = {};
        return new Promise(function (resolve, reject) {
            model["_id"] = new bson_objectid_1["default"](model["_id"]);
            model["_vdate"] = Date.now();
            _this.collection.upsert(model, function (result) {
                if (_this.track) {
                    var trackRecord = {
                        date: Date.now(),
                        model: null,
                        diff: null,
                        type: isFromInsertOne
                            ? serendip_business_model_1.EntityChangeType.Create
                            : serendip_business_model_1.EntityChangeType.Update,
                        userId: userId,
                        collection: _this.collectionName,
                        entityId: model["_id"]
                    };
                    if (!trackOptions.metaOnly) {
                        trackRecord.model = model;
                        trackRecord.diff = fast_json_patch_1.compare(result, model);
                    }
                    _this.provider.changes.insertOne(trackRecord);
                }
                _this.provider.events[_this.collectionName].emit(isFromInsertOne ? "insert" : "update", result);
                resolve(result);
            }, function (err) { return reject(err); });
        });
    };
    MingodbCollection.prototype.deleteOne = function (_id, userId, trackOptions) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var model, modelQuery;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({ _id: _id })];
                    case 1:
                        modelQuery = _a.sent();
                        if (modelQuery && modelQuery[0])
                            model = modelQuery[0];
                        else
                            return [2 /*return*/, reject("not found")];
                        this.collection.remove(_id, function () { return __awaiter(_this, void 0, void 0, function () {
                            var trackRecord;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this.track) return [3 /*break*/, 2];
                                        trackRecord = {
                                            date: Date.now(),
                                            diff: null,
                                            type: serendip_business_model_1.EntityChangeType.Delete,
                                            userId: userId,
                                            collection: this.collectionName,
                                            entityId: _id,
                                            model: null
                                        };
                                        if (trackOptions && trackOptions.metaOnly)
                                            trackRecord.model = model;
                                        return [4 /*yield*/, this.provider.changes.insertOne(trackRecord)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        this.provider.events[this.collectionName].emit("delete", model);
                                        resolve(model);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, function (err) {
                            console.error("error in deleting " + _id + " from " + _this.collectionName);
                            reject(err);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    MingodbCollection.prototype.insertOne = function (model, userId, trackOptions) {
        return this.updateOne(model, userId, trackOptions, true);
    };
    return MingodbCollection;
}());
exports.MingodbCollection = MingodbCollection;
