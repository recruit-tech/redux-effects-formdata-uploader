import uploadMiddleware, { upload } from '../index.js';
import { createStore, applyMiddleware } from 'redux';
import { createAction } from 'redux-actions';
import serverFactory from './server.js';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import axios from 'axios';

test('show progress file upload', (done) => {
  const server = serverFactory({ fieldName: "file"});
  server.listen(0);
  server.on("listening", async () => {
    const port = server.address().port;
    const store = createStore(
      () => null,
      {},
      applyMiddleware(uploadMiddleware({
        baseURL: `http://localhost:${port}`,
      })),
    );

    const file = fs.createReadStream(path.resolve(__dirname, "./fixtures/foo.txt"))
    const onUploadProgress = (evt) => {
      // TODO(browser upload)
    };
    const up = upload({ path: "/file", name: "file", file, onUploadProgress });
    const uploading = await store.dispatch(up)
    server.close();
  })
  server.on("close", done)
});
