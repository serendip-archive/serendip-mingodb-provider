import { join } from "path";
import * as assert from "assert";
import {
  DbCollectionInterface,
  DbProviderInterface
} from "serendip-business-model";
import * as fs from "fs-extra";
import * as dotenv from "dotenv";
import { MingodbProvider } from "../MingodbProvider";


dotenv.config();
describe("find scenarios", () => {
  let provider: DbProviderInterface;
  let collection: DbCollectionInterface<any>;

  beforeEach(done => {
    (async () => {
      // runs before each test in this block

      provider = new MingodbProvider();
      await provider.initiate({
        MingoDb: process.env["db.MingoDb"],
        mongoUrl: process.env["db.mongoUrl"],
        authSource: process.env["db.authSource"],
        user: process.env["db.user"],
        password: process.env["db.password"]
      });
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

      const model = await collection.find({ hello: true })


      assert.equal(model.length, 10);
    })()
      .then(done)
      .catch(done);
  });

  it("should do $gte find", done => {
    (async () => {


      for (let i = 0; i < 10; i++) {
        await collection.insertOne({
          number: i
        });
      }

      const model = await collection.find({ number: { $gte: 5 } })

      assert.equal(model.length, 5);

    })()
      .then(done)
      .catch(done);
  });


  it("should do $elemMatch find on subarray", done => {
    (async () => {


      for (let i = 0; i < 10; i++) {
        await collection.insertOne({
          numbers: [i]
        });
      }

      const model = await collection.find({ numbers: { $elemMatch: { $gte: 5 } } })

      assert.equal(model.length, 5);

    })()
      .then(done)
      .catch(done);
  });

  it("should do $elemMatch find on sub object-array", done => {
    (async () => {


      for (let i = 0; i < 10; i++) {
        await collection.insertOne({
          numbers: [{
            n: i
          }]
        });
      }

      const model = await collection.find({ numbers: { $elemMatch: { n: { $gte: 5 } } } })

      assert.equal(model.length, 5);

    })()
      .then(done)
      .catch(done);
  });





});
