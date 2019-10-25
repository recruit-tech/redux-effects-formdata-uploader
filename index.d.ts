import { Middleware, Dispatch, AnyAction } from "redux"
import { AxiosResponse, CancelTokenSource } from "axios"
import { Stream } from "stream"

export declare type Config = Partial<{
  csrfToken?: string
} & Record<string, any>>

export declare const UPLOADER: "EFFECT_FORMDATA_UPLOADER"
export declare const UPLOAD: "EFFECT_FORMDATA_UPLOADER/upload"

export type Payload = {
  path: string,
  name: string,
  // See: https://github.com/axios/axios#request-config
  // - Browser only: FormData, File, Blob
  // - Node only: Stream, Buffer
  file: FormData | Blob | File | Stream | Buffer,
  params?: Record<string, string | number>,
  config?: Config,
  cancelAction?: (cancelSource: CancelTokenSource) => ({ type: string, payload?: any, meta?: Record<string, any> })
  uploadProgressAction?: (e: ProgressEvent) => ({ type: string, payload?: any, meta?: Record<string, any> }),
}

export declare function upload<P extends Payload = Payload>(payload: P): {
  type: typeof UPLOAD,
  payload: P,
}

/**
 * uploadMiddleware
 * @template — DispatchExt Extra Dispatch signature added by this middleware.
 * @template — S The type of the state supported by this middleware.
 */
export default function uploadMiddleware<Ext = {}, S = any>(config?: Config): Middleware<Ext, S>