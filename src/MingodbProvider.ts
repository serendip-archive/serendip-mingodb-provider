import { MingodbCollection } from "./MingodbCollection";
import {
  DbCollectionInterface,
  DbProviderInterface,
  EntityChangeModel
} from "serendip-business-model";
import { EventEmitter } from "events";
import * as fs from "fs-extra";
import { Writable, Readable } from "stream";
import { MemoryDb } from "minimongo";

export class MingodbProvider implements DbProviderInterface {
  changes: DbCollectionInterface<EntityChangeModel>;

  /**
   * Instance of MingoDb database
   */
  public db: MemoryDb;

  // you can listen for  any "update","delete","insert" event. each event emitter is accessible trough property named same as collectionName
  public events: { [key: string]: EventEmitter } = {};
  _collections: { [key: string]: MingodbCollection<any> } = {};

  public async dropDatabase() {}

  public async dropCollection(name: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.db.removeCollection(
        name,
        () => resolve(true),
        err => reject(err)
      );
    });
  }

  public async collections(): Promise<string[]> {
    return this.db.getCollectionNames();
  }

  public async openUploadStreamByFilePath(
    filePath: string,
    metadata: any
  ): Promise<Writable> {
    await fs.remove(filePath);
    return fs.createWriteStream(filePath, {});
  }

  public async openDownloadStreamByFilePath(
    filePath: string,
    opts?: { start?: number; end?: number; revision?: number }
  ): Promise<Readable> {
    return fs.createReadStream(filePath, {});
  }

  public async stats(): Promise<{
    db: string;
    collections: number;
    indexes: number;
    avgObjSizeByte: number;
    objects: number;
    storageMB: number;
    fsUsedMB: number;
    fsTotalMB: number;
  }> {
    return {
      db: null,
      collections: null,
      indexes: null,
      avgObjSizeByte: null,
      objects: null,
      fsUsedMB: null,
      fsTotalMB: null,
      storageMB: null
    };
  }

  public async collection<T>(
    collectionName: string,
    track?: boolean
  ): Promise<DbCollectionInterface<T>> {
    collectionName = collectionName.trim();

    if ((await this.collections()).indexOf(collectionName) === -1) {
      await new Promise((resolve, reject) => {
        this.db.addCollection(
          collectionName,
          () => resolve(),
          err => reject(err)
        );
      });

      // console.log(`☑ collection ${collectionName} created .`);
    }

    if (!this.events[collectionName])
      this.events[collectionName] = new EventEmitter();

    if (!this._collections[collectionName])
      this._collections[collectionName] = new MingodbCollection<T>(
        this.db.collections[collectionName],
        track,
        this,
        collectionName
      );

    return this._collections[collectionName];
  }
  async initiate(options: any): Promise<void> {
    try {
      this.db = new MemoryDb();

      this.changes = await this.collection<EntityChangeModel>(
        "EntityChanges",
        false
      );
    } catch (error) {
      throw new Error(
        "\n\nUnable to initiate to MiniMongo. Error details: \n" + error.message
      );
    }
  }
}
