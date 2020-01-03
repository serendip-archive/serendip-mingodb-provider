import { join } from "path";
import * as assert from "assert";
import {
  DbCollectionInterface,
  DbProviderInterface
} from "serendip-business-model";
import * as fs from "fs-extra";

import { MingodbProvider } from "../MingodbProvider";

describe("aggregate scenarios", () => {
  let provider: DbProviderInterface;
  let collection: DbCollectionInterface<any>;

  beforeEach(done => {
    (async () => {
      // runs before each test in this block

      provider = new MingodbProvider();
      await provider.initiate();
      try {
        await provider.dropCollection("test");
      } catch (error) {}
      collection = await provider.collection("test");

      done();
    })();
  });
  it("should do simple find", done => {
    (async () => {
      for (let i = 0; i < 10; i++) {
        await collection.insertOne({
          hello: true
        });
      }

      const model = await collection.aggregate([{ $match: { hello: true } }]);

      assert.equal(model.length, 10);
    })()
      .then(done)
      .catch(done);
  });

  it("should do $gte aggregate", done => {
    (async () => {
      for (let i = 0; i < 10; i++) {
        await collection.insertOne({
          number: i
        });
      }

      const model = await collection.aggregate([
        { $match: { number: { $gte: 5 } } }
      ]);

      assert.equal(model.length, 5);
    })()
      .then(done)
      .catch(done);
  });

  it("should do $elemMatch aggregate on subarray", done => {
    (async () => {
      for (let i = 0; i < 10; i++) {
        await collection.insertOne({
          numbers: [i]
        });
      }

      const model = await collection.aggregate([
        { $match: { numbers: { $elemMatch: { $gte: 5 } } } }
      ]);

      assert.equal(model.length, 5);
    })()
      .then(done)
      .catch(done);
  });
});
