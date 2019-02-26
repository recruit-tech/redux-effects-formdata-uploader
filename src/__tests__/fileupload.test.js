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
  server.on("listening", () => {
    const port = server.address().port;
    const store = createStore(
      () => null,
      {},
      applyMiddleware(
        uploadMiddleware({
          baseURL: `http://localhost:${port}`,
        }),
      ),
    );

    const filepath = path.resolve(__dirname, "./fixtures/foo.txt");
    const file = fs.createReadStream(filepath);

    store
      .dispatch(upload({ path: "/file", name: config.fieldName, file }))
      .then(res => {
        assert.strictEqual(res.status, 200);
        assert(res.data);
        return res;
      })
      .then(res => {
        Promise.all([readFile(res.data.path), readFile(filepath)]).then(
          ([actual, expected]) => {
            assert.strictEqual(actual.toString(), expected.toString());
            server.close();
          },
        );
      })
      .catch(e => {
        assert.fail(e);
      });
  });
  server.on("close", done);
});
