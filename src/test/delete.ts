import { join } from "path";
import * as assert from "assert";
import {
    DbCollectionInterface,
    DbProviderInterface
} from "serendip-business-model";
import * as fs from "fs-extra";
 import { MingodbProvider } from "../MingodbProvider";


describe("delete scenarios", () => {
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
            } catch (error) { }
            collection = await provider.collection("test");

            done();
        })();
    });
    it("should return deleted", done => {
        (async () => {
            let model = await collection.insertOne({
                hello: true
            });

            let insertId = model._id;

            model = await collection.deleteOne(model._id);

            assert.equal(model.hello, true);
            assert.equal(model._id, insertId);

        })()
            .then(done)
            .catch(done);
    });


    it("should delete", done => {
        (async () => {

            const model = await collection.insertOne({
                _id: "5c6e96da5da4508426d6f25b",
                toBeDeleted: true
            });

            await collection.deleteOne(model._id);

        })()
            .then(done)
            .catch(done);
    });

    it("should get delete event", done => {
        (async () => {
            let model = await collection.insertOne({
                hello: true
            });


            provider.events["test"].on("delete", doc => {
                assert.equal(model._id.toString(), doc._id.toString());
                assert.equal(model.hello, doc.hello);

                done();
            });

            model = await collection.deleteOne(model._id);

        })()
            .then(() => { })
            .catch(done);
    });



});
