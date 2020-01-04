import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import { MemoryDb } from 'minimongo';
import * as path from 'path';
import { DbCollectionInterface, DbProviderInterface, EntityChangeModel } from 'serendip-business-model';
import { Readable, Writable } from 'stream';

import { MingodbCollection } from './MingodbCollection';
import { MingodbProviderOptions } from './MingodbProviderOptions';
import * as glob from 'fast-glob'

export class MingodbProvider implements DbProviderInterface {
  changes: DbCollectionInterface<EntityChangeModel>;

  /**
   * Instance of MingoDb database
   */
  public db: MemoryDb;

  // you can listen for  any "update","delete","insert" event. each event emitter is accessible trough property named same as collectionName
  public events: { [key: string]: EventEmitter } = {};
  _collections: { [key: string]: MingodbCollection<any> } = {};
  dbPath: string;
  fsPath: string;
  options: MingodbProviderOptions;

  public async dropDatabase() {
    await fs.unlink(this.dbPath);
    await this.initiate(this.options);
  }

  public async dropCollection(name: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      await fs.emptyDir(path.join(this.dbPath, name))
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

  public async deletePath(
    _path: string,
  ): Promise<void> {

    if (!_path.startsWith('/')) {
      _path = path.join(this.fsPath, _path)
    }

    if ((await fs.stat(_path)).isFile()) {
      await fs.remove(_path);
    } else {
      await fs.emptyDir(_path);
      await fs.rmdir(_path);
    }

  }
  public async openUploadStreamByFilePath(
    filePath: string,
    metadata: any
  ): Promise<Writable> {

    if (!filePath.startsWith('/')) {
      filePath = path.join(this.fsPath, filePath)
    }

    await fs.remove(filePath);
    return fs.createWriteStream(filePath, {});
  }

  public async openDownloadStreamByFilePath(
    filePath: string,
    opts?: { start?: number; end?: number; revision?: number }
  ): Promise<Readable> {

    if (!filePath.startsWith('/')) {
      filePath = path.join(this.fsPath, filePath)
    }

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
      db: 'mingodb',
      collections: (await this.collections()).length,
      indexes: null,
      avgObjSizeByte: null,
      objects: (await glob(path.join(this.dbPath, './**/*.json'))).length,
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

    const collectionPath = path.join(this.dbPath, collectionName);

    await fs.ensureDir(collectionPath);

    if ((await this.collections()).indexOf(collectionName) === -1) {
      await new Promise((resolve, reject) => {
        this.db.addCollection(
          collectionName,
          () => resolve(),
          err => reject(err)
        );
      });

      const collectionPath = path.join(this.dbPath, collectionName);
      const jsonFiles = await fs.readdir(collectionPath);


      for (const jsonFile of jsonFiles) {
        await new Promise<boolean>(async (resolve, reject) => {
          this.db.collections[collectionName].upsert(
            await fs.readJson(path.join(collectionPath, jsonFile)),
            () => resolve(),
            (err) => reject(err))
        });
      }
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
  async initiate(_options?: MingodbProviderOptions): Promise<void> {
    const defaultOptions = {
      mingoPath: "./mingo"
    };

    this.options = {
      ...defaultOptions,
      ..._options
    };

    try {
      this.db = new MemoryDb();

      await fs.ensureDir(this.options.mingoPath);

      this.dbPath = path.join(this.options.mingoPath, "db");
      this.fsPath = path.join(this.options.mingoPath, "fs");
      await fs.ensureDir(this.dbPath);
      await fs.ensureDir(this.fsPath);

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
