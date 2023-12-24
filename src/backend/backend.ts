import express from "express";
import * as t from "runtypes";
import { toErr } from "../ts";

express()
  .use(express.static("build"))
  .use((req, res, next) => {
    if (req.method == "GET" && req.path != "/rpc") {
      res.send("kek");
    } else {
      next();
    }
  })
  .options("/rpc", (_req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Method", "POST");
    res.header("Access-Control-Allow-Headers", "*");
    res.sendStatus(200);
  })
  .post("/rpc", express.json(), async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Method", "POST");
    res.header("Access-Control-Allow-Headers", "*");
    res.send(await dispatch(req.body));
  })
  .listen(2346);

const methods = {} as Record<string, (params: unknown) => Promise<unknown>>;

const dispatch = async (body: unknown) => {
  const ok = (data: unknown) => ({ jsonrpc: "2.0", data });
  const err = (msg: string) => ({ jsonrpc: "2.0", error: { message: msg } });
  if (typeof body != "object" || body == null) {
    return err("failed to parse body");
  }
  try {
    const { method, params } = t
      .Record({ method: t.String, params: t.Unknown.optional() })
      .check(body);
    console.log(method, params);
    return ok(await methods[method](params));
  } catch (any) {
    const e = toErr(any);
    return err(e.message);
  }
};
