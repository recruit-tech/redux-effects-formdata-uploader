# redux-effects-formdata-uploader

[`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) binding for `redux-effects` family.

# Install

```
$ npm install redux-effects-formdata-uploader
```

# Usage

Register `redux-effects-formdata-uploader` as middleware

```javascript
import { createStore, applyMiddleware } from 'redux';
import uploadMiddleware from 'redux-effects-formdata-uploader';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(
    // specify hostname
    uploadMiddleware({
      baseURL: `http://localhost:${port}`,
    })
  )
);
```

Usage `redux-effects-formdata-uploader` as client

```javascript
import { createAction } from 'redux-actions';
import { upload } from 'redux-effects-formdata-uploader';

export const cancelAction = createAction("on_cancel", (cancelSource) => {
  cancelSource.cancel();
});
export const uploadAction = (file) => upload({ path: "/file", name: "file", file, cancelAction });
```

Use from component

```javascript
const promise = store.dispatch(uploadAction(file));

if (cancelled) {
  const cancelPromise = store.dispatch(cancelAction));
}
```

# API

## upload({ path, name, file, cancelAction }) 

upload `file` to server.

- path: filepath, if your path is `/filepath`, then POST to `/filepath`
- name: formdata name, if your name is `file`, then request `file=value`
- file: file instance
- cancelAction: cancelAction can receive cancel source, if you want to cancel upload, you need to get `cancel source`

# full example

```
import { createStore, applyMiddleware } from "redux";
import { createAction } from "redux-actions";
import fs from "fs";
import path from "path";
import assert from "assert";
import axios from "axios";
import serverFactory from "./server.js";
import uploadMiddleware, { upload } from "../index.js";

test("cancel file upload", (done) => {
  const server = serverFactory({ fieldName: "file" });
  server.listen(0);
  server.on("listening", async () => {
    const port = server.address().port;
    const store = createStore(
      () => null,
      {},
      applyMiddleware(
        uploadMiddleware({
          baseURL: `http://localhost:${port}`,
        })
      )
    );

    const file = fs.createReadStream(
      path.resolve(__dirname, "./fixtures/foo.txt")
    );
    const cancelAction = createAction("on_cancel", (cancelSource) => {
      setImmediate(cancelSource.cancel);
    });
    const up = upload({ path: "/file", name: "file", file, cancelAction });
    store.dispatch(up).catch((e) => {
      assert(e);
      assert(axios.isCancel(e));
      server.close();
    });
  });
  server.on("close", done);
});
```
