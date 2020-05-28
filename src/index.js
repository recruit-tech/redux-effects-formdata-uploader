import FormData from "isomorphic-form-data";
import querystring from "querystring";
import axios from "axios";

/*
 * Action types
 */
export const UPLOADER = "EFFECT_FORMDATA_UPLOADER";
export const UPLOAD = `${UPLOADER}/upload`;

/*
 * Action creators
 */
export function upload({
  path,
  name,
  file,
  params,
  config,
  cancelAction,
  uploadProgressAction,
}) {
  return {
    type: UPLOAD,
    payload: {
      path,
      name,
      file,
      params,
      config,
      cancelAction,
      uploadProgressAction,
    },
  };
}

/**
 * uploader middleware
 */
export default function uploadMiddleware(config) {
  const client = axios.create(config);
  return ({ dispatch }) => (next) => (action) => {
    const { type, payload } = action;
    if (!type.startsWith(UPLOADER)) {
      return next(action);
    }

    return uploadSingleFile(dispatch, payload, client, config.csrfToken);
  };
}

function uploadSingleFile(dispatch, payload, client, csrfToken) {
  const formData = new FormData();
  formData.append(payload.name, payload.file);

  const qs = querystring.stringify({ ...payload.params, _csrf: csrfToken });

  const headers = formData.getHeaders && formData.getHeaders();

  const cancelSource = axios.CancelToken.source();
  payload.cancelAction && dispatch(payload.cancelAction(cancelSource));

  const cancelToken = cancelSource.token;
  const onUploadProgress = (evt) => {
    payload.uploadProgressAction && dispatch(payload.uploadProgressAction(evt));
  };
  return client.post(`${payload.path}?${qs}`, formData, {
    cancelToken,
    headers,
    onUploadProgress,
  });
}
