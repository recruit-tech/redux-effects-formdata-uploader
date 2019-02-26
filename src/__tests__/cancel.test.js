import { createStore, applyMiddleware } from "redux";
import { createAction } from "redux-actions";
import fs from "fs";
import path from "path";
import assert from "assert";
import axios from "axios";
import serverFactory from "./server.js";
import uploadMiddleware, { upload } from "../index.js";

test("cancel file upload", done => {
  const server = serverFactory({ fieldName: "file" });
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

    const file = fs.createReadStream(
      path.resolve(__dirname, "./fixtures/foo.txt"),
    );
    const cancelAction = createAction("on_cancel", cancelSource => {
      setImmediate(cancelSource.cancel);
    });
    const up = upload({ path: "/file", name: "file", file, cancelAction });
    store.dispatch(up).catch(e => {
      assert(e);
      assert(axios.isCancel(e));
      server.close();
    });
  });
  server.on("close", done);
});
