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
  cancelSource,
  onUploadProgress,
}) {
  return {
    type: UPLOAD,
    payload: {
      path,
      name,
      file,
      params,
      config,
      cancelSource,
      onUploadProgress,
    },
  };
}

/**
 * uploader middleware
 */
export default function uploadMiddleware(config) {
  const client = axios.create(config)
  return ({ dispatch }) => (next) => (action) => {
    const { type, payload } = action;
    if (!type.startsWith(UPLOADER)) {
      return next(action);
    }

    return _upload(payload, client, config.csrfToken)
  };
}

function _upload(payload, axios, csrfToken) {
  const formData = new FormData();
  formData.append(payload.name, payload.file);

  const qs = querystring.stringify({ ...payload.params, _csrf: csrfToken });

  const headers = formData.getHeaders && formData.getHeaders();

  const cancelToken = payload.cancelSource && payload.cancelSource.token
  const onUploadProgress = payload.onUploadProgress
  return axios.post(`${payload.path}?${qs}`, formData, { cancelToken, headers, onUploadProgress });
}
