import { join } from "path";
import * as assert from "assert";
import {
  DbCollectionInterface,
  DbProviderInterface
} from "serendip-business-model";
import * as fs from "fs-extra";

import { MingodbProvider } from "../MingodbProvider";


describe("init scenarios", () => {
  let provider: DbProviderInterface;
  let collection: DbCollectionInterface<any>;

  it("should do simple initiate", done => {
    (async () => {
      const provider = new MingodbProvider();


      await provider.initiate();


    })()
      .then(done)
      .catch(done);
  });

  it("should get stats", done => {
    (async () => {
      const provider = new MingodbProvider();

      await provider.initiate();


      console.info(JSON.stringify(await provider.stats(), null, 2)
        .replace('{', '\t{')
        .replace(/\n/g, '\n\t'));


    })()
      .then(done)
      .catch(done);
  });
});
