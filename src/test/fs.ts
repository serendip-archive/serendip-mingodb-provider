import { join } from "path";
import * as assert from "assert";
import {
  DbCollectionInterface,
  DbProviderInterface
} from "serendip-business-model";
import * as fs from "fs-extra";

import { MingodbProvider } from "../MingodbProvider";

describe("gridfs scenarios", () => {
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
        await provider.dropCollection("fs.files");
        await provider.dropCollection("fs.chunks");
      } catch (error) {}
      collection = await provider.collection("fs.files");

      done();
    })();
  });
  it("should upload", done => {
    (async () => {
      const uploadStream = await (provider as MingodbProvider).openUploadStreamByFilePath(
        "package.json",
        {}
      );

      fs.createReadStream("package.json").pipe(uploadStream);

      return new Promise((resolve, reject) => {
        uploadStream.on("finish", async () => {
          const downloadStream = await (provider as MingodbProvider).openDownloadStreamByFilePath(
            "package.json"
          );
          let data = "";
          downloadStream.on("data", chunk => {
            data += chunk;
          });

          downloadStream.on("end", () => {
            assert.equal(fs.readFileSync("package.json").toString(), data);
            resolve();
          });
        });
      });
    })()
      .then(done)
      .catch(done);
  }).timeout(1000);

  it("upload should overwrite on same path with different streams", done => {
    (async () => {
      for (let i = 0; i < 3; i++) {
        await new Promise(async (resolve, reject) => {
          const uploadStream = await (provider as MingodbProvider).openUploadStreamByFilePath(
            "test",
            {}
          );
          uploadStream.write(i.toString());
          uploadStream.end();
          uploadStream.on("finish", resolve);
        });
      }

      return new Promise(async (resolve, reject) => {
        const downloadStream = await (provider as MingodbProvider).openDownloadStreamByFilePath(
          "test"
        );
        let data = "";
        downloadStream.on("data", chunk => {
          data += chunk;
        });

        downloadStream.on("end", () => {
          assert.equal("2", data);
          resolve();
        });
      });
    })()
      .then(done)
      .catch(done);
  }).timeout(1000);
});
