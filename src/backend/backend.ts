import * as crypto from "crypto";
import express from "express";
import * as t from "runtypes";
import { toErr } from "../ts";
import { loadFavs, loadWorkouts, saveFavs, saveWorkouts } from "./db";

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

const methods: Record<string, (x?: unknown) => Promise<unknown>> = {
  async getWorkouts() {
    const t = loadWorkouts();
    return {
      archive: t.filter((x) => x.archived && x.archived != ""),
      planned: t.filter((x) => !x.archived && !x.swam),
      workouts: t.filter((x) => !x.archived && x.swam),
      favorites: loadFavs(),
    };
  },

  async addPlan(arg: unknown) {
    const w = t
      .Record({
        title: t.String,
        text: t.String,
      })
      .check(arg);
    const id = crypto.createHash("md5").update(JSON.stringify(w)).digest("hex");
    const tbl = loadWorkouts();
    tbl.push({
      id,
      created: new Date().toISOString(),
      title: w.title,
      ex: w.text.split("\n"),
    });
    saveWorkouts(tbl);
  },

  async import(args: unknown) {
    const ww = t
      .Array(
        t.Record({
          id: t.String,
          title: t.String,
          ex: t.Array(t.String),
          created: t.String,
          swam: t.String,
          archived: t.String,
        })
      )
      .check(args);
    const tbl = loadWorkouts();
    for (const w of ww) {
      tbl.push(w);
    }
    saveWorkouts(tbl);
  },

  async archive(args: unknown) {
    const id = t.Record({ id: t.String }).check(args).id;
    const tbl = loadWorkouts();
    const w = tbl.find((x) => x.id == id);
    if (!w) {
      throw new Error(`not found`);
    }
    if (w.archived) {
      throw new Error(`already archived`);
    }
    w.archived = new Date().toISOString();
    saveWorkouts(tbl);
  },

  async setFavorite(args0: unknown) {
    const args = t.Record({ ex: t.String, fav: t.Boolean }).check(args0);
    const f = loadFavs();
    const pos = f.indexOf(args.ex);
    if (args.fav) {
      if (pos >= 0) {
        return;
      }
      f.push(args.ex);
    } else {
      if (pos < 0) {
        return;
      }
      f.splice(pos, 1);
    }
    saveFavs(f);
  },
};

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
