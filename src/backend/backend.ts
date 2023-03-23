import express from "express";
import * as fs from "fs";
import * as t from "runtypes";
import { toErr } from "../ts";
import { WorkoutFromJSON } from "../types";
import * as crypto from "crypto";

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

const table = (name: string) => {
  const data = JSON.parse(fs.readFileSync(`data/${name}.json`).toString());
  return data.records as WorkoutFromJSON[];
};

const favs = () => {
  try {
    const data = JSON.parse(fs.readFileSync(`data/favorites.json`).toString());
    return data as string[];
  } catch (err) {
    return [] as string[];
  }
};

const writeFavs = (favs: string[]) => {
  const name = "favorites";
  try {
    fs.copyFileSync(
      `data/${name}.json`,
      `data/backup-${Date.now()}-${name}.json`
    );
  } catch (err) {
    console.log(err);
  }
  fs.writeFileSync(`data/${name}.json`, JSON.stringify(favs, null, 2));
};

const writeTable = (name: string, records: WorkoutFromJSON[]) => {
  fs.copyFileSync(
    `data/${name}.json`,
    `data/backup-${Date.now()}-${name}.json`
  );
  fs.writeFileSync(`data/${name}.json`, JSON.stringify({ records }, null, 2));
};

const methods: Record<string, (x?: unknown) => Promise<unknown>> = {
  async getWorkouts() {
    const t = table("data");
    return {
      archive: t.filter((x) => x.archived),
      planned: t.filter((x) => !x.archived && !x.swam),
      workouts: t.filter((x) => !x.archived && x.swam),
      favorites: favs(),
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
    const tbl = table("data");
    tbl.push({
      id,
      created: new Date().toISOString(),
      title: w.title,
      ex: w.text.split("\n"),
    });
    writeTable("data", tbl);
  },

  async archive(args: unknown) {
    const id = t.Record({ id: t.String }).check(args).id;
    console.log("archive", id);
    const tbl = table("data");
    const w = tbl.find((x) => x.id == id);
    if (!w) {
      throw new Error(`not found`);
    }
    if (w.archived) {
      throw new Error(`already archived`);
    }
    w.archived = new Date().toISOString();
    writeTable("data", tbl);
  },

  async setFavorite(args0: unknown) {
    const args = t.Record({ ex: t.String, fav: t.Boolean }).check(args0);
    const f = favs();
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
    writeFavs(f);
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
