import { createStore, applyMiddleware } from "redux";
import fs from "fs";
import path from "path";
import assert from "assert";
import axios from "axios";
import serverFactory from "./server.js";
import uploadMiddleware, { upload } from "../index.js";

test("cancel file upload", done => {
  const server = serverFactory({ fieldName: "file" });
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

    const cancelSource = axios.CancelToken.source();
    const file = fs.createReadStream(
      path.resolve(__dirname, "./fixtures/foo.txt")
    );
    const up = upload({ path: "/file", name: "file", file, cancelSource });
    store.dispatch(up).catch(e => {
      assert(e);
      assert(axios.isCancel(e));
      server.close();
    });
    cancelSource.cancel();
  });
  server.on("close", done);
});
