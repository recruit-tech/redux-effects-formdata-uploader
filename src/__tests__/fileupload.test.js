import { createStore, applyMiddleware } from "redux";
import fs from "fs";
import path from "path";
import assert from "assert";
import { promisify } from "util";
import serverFactory from "./server.js";
import uploadMiddleware, { upload } from "../index.js";

const readFile = promisify(fs.readFile);

test("upload single file", done => {
  const config = { fieldName: "file" };
  const server = serverFactory(config);
  server.listen(0);
  server.on("listening", async () => {
    const port = server.address().port;
    const store = createStore(
      () => null,
      {},
      applyMiddleware(
        uploadMiddleware({
          baseURL: `http://localhost:${port}`
        })
      )
    );

    const filepath = path.resolve(__dirname, "./fixtures/foo.txt");
    const file = fs.createReadStream(filepath);

    const res = await store
      .dispatch(upload({ path: "/file", name: config.fieldName, file }))
      .catch(e => {
        assert.fail(e);
      });

    assert.strictEqual(res.status, 200);
    assert(res.data);
    const actual = await readFile(res.data.path);
    const expected = await readFile(filepath);
    assert.strictEqual(actual.toString(), expected.toString());
    server.close();
  });
  server.on("close", done);
});
