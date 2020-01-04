import {
  EntityChangeType,
  DbCollectionInterface,
  CollectionAggregationOptions
} from "serendip-business-model";
import { applyOperation, compare } from "fast-json-patch";
import { MingodbProvider } from "./MingodbProvider";
import { EventEmitter } from "events";
import { MinimongoCollection } from "minimongo";
import ObjectID from "bson-objectid";
import * as Mingo from "mingo";
import MingoTypes from "mingo";
import * as path from 'path'
import * as fs from 'fs-extra'

const mingo: typeof MingoTypes = Mingo as any;

export class MingodbCollection<T> implements DbCollectionInterface<T> {
  constructor(
    private collection: MinimongoCollection<T>,
    private track: boolean,
    private provider: MingodbProvider,
    private collectionName: string
  ) { }

  public async ensureIndex(fieldOrSpec: any, options: any) { }

  public async aggregate(pipeline: any[], options: any) {
    return mingo.aggregate(await this.find({}), pipeline);
  }
  public find(query?, skip?: any, limit?: any): Promise<T[]> {
    if (skip) skip = parseInt(skip);
    if (limit) limit = parseInt(limit);
    return new Promise((resolve, reject) => {
      this.collection.find({}).fetch(
        results => {
          resolve(
            mingo
              .find<T>(results, query)
              .skip(skip)
              .limit(limit)
              .all()
          );
        },
        err => reject(err)
      );
    });
  }
  public count(query?): Promise<Number> {
    if (query && query._id) {
      query._id = new ObjectID(query._id);
    }
    return new Promise((resolve, reject) => {
      this.collection.find(query).fetch(
        items => resolve(items.length),
        err => reject(err)
      );
    });
  }
  public updateOne(
    model: T,
    userId?: string,
    trackOptions?: { metaOnly?: boolean },
    isFromInsertOne?: boolean
  ): Promise<T> {
    if (!trackOptions) trackOptions = {};

    return new Promise((resolve, reject) => {
      model["_id"] = new ObjectID(model["_id"]);
      model["_vdate"] = Date.now();

      this.collection.upsert(
        model,
        async result => {
          if (this.track) {
            const trackRecord = {
              date: Date.now(),
              model: null,
              diff: null,
              type: isFromInsertOne
                ? EntityChangeType.Create
                : EntityChangeType.Update,
              userId: userId,
              collection: this.collectionName,
              entityId: model["_id"]
            };

            if (!trackOptions.metaOnly) {
              trackRecord.model = model;
              trackRecord.diff = compare(result, model);
            }
            this.provider.changes.insertOne(trackRecord);
          }

          this.provider.events[this.collectionName].emit(
            isFromInsertOne ? "insert" : "update",
            result
          );

          const documentPath = path.join(this.provider.dbPath,
            this.collectionName,
            (result as any)._id + '.json');
          await fs.writeJSON(documentPath, result, {
            replacer: null,
            spaces: 2,

          })

          resolve(result);
        },
        err => reject(err)
      );
    });
  }
  public deleteOne(
    _id: string | any,
    userId?: string,
    trackOptions?: { metaOnly: boolean }
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      var model: any;
      var modelQuery = await this.find({ _id: _id });
      if (modelQuery && modelQuery[0]) model = modelQuery[0];
      else return reject("not found");
      this.collection.remove(
        _id,
        async () => {
          if (this.track) {
            let trackRecord = {
              date: Date.now(),
              diff: null,
              type: EntityChangeType.Delete,
              userId: userId,
              collection: this.collectionName,
              entityId: _id,
              model: null
            };

            if (trackOptions && trackOptions.metaOnly)
              trackRecord.model = model;

            await this.provider.changes.insertOne(trackRecord);
          }

          this.provider.events[this.collectionName].emit("delete", model);

          const documentPath = path.join(this.provider.dbPath,
            this.collectionName,
            _id + '.json');

          await fs.unlink(documentPath)
          resolve(model);
        },
        err => {
          console.error(`error in deleting ${_id} from ${this.collectionName}`);
          reject(err);
        }
      );
    });
  }
  public insertOne(
    model: T | any,
    userId?: string,
    trackOptions?: { metaOnly?: boolean }
  ): Promise<T> {
    return this.updateOne(model, userId, trackOptions, true);
  }
}
