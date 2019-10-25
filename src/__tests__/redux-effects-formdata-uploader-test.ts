import fs from "fs";
import path from "path";
import { AnyAction, Middleware } from "redux";
import { CancelTokenSource } from "axios";
import uploadMiddleware, { upload, UPLOAD, Payload } from "../../";

type AssertEqual<T, Expected> =
  T extends Expected
  ? (Expected extends T ? true : never)
  : never;

function assertType<_T extends true>() {}

const action = upload({
  path: "/foo",
  name: "file-name",
  file: fs.createReadStream(path.resolve(__dirname, "./fixtures/foo.txt")),
  params: {
    foo: 1,
  },
  cancelAction: cancelSource => {
    // expected infer the `cancelSource`
    assertType<AssertEqual<typeof cancelSource, CancelTokenSource>>();
    cancelSource.cancel();
    return {
      type: "on_cancel",
    };
  },
  uploadProgressAction: event => {
    // expected infer the `event`
    assertType<AssertEqual<typeof event, ProgressEvent>>();
    return {
      type: "on_upload_progress",
      progress: event.total,
    };
  },
});

// check action types
type Result = AssertEqual<{ type: typeof UPLOAD, payload: Payload }, typeof action>;
assertType<Result>();

// check for redux
assertType<AssertEqual<AnyAction, typeof action>>();

// check middleware types
const middleware = uploadMiddleware();
assertType<AssertEqual<typeof middleware, Middleware>>();
