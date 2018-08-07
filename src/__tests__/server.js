import express from "express";
import http from "http";
import multer from "multer";
import os from "os";
import path from "path";

export default (config) => {
  const app = express()
  const upload = multer({ dest: path.resolve(__dirname, os.tmpdir()) });
  const server = http.Server(app);
  app.post('/file', upload.single(config.fieldName), (req, res, next) => {
    console.log(req.file)
    res.send(req.file);
  })

  return server;
}
