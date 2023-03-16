import express from "express";
import * as fs from "fs";
import * as t from "runtypes";
import { toErr } from "../ts";
import { PlannedWorkout, WorkoutFromJSON } from "../types";

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
  return data.records;
};

const writeTable = (name: string, records: unknown[]) => {
  fs.copyFileSync(
    `data/${name}.json`,
    `data/backup-${Date.now()}-${name}.json`
  );
  fs.writeFileSync(`data/${name}.json`, JSON.stringify({ records }, null, 2));
};

const get = () => {
  return {
    archive: table("archive") as WorkoutFromJSON[],
    planned: table("planned") as PlannedWorkout[],
    workouts: table("workouts") as WorkoutFromJSON[],
  };
};

const flush = (db: ReturnType<typeof get>) => {
  writeTable("archive", db.archive);
  writeTable("planned", db.planned);
  writeTable("workouts", db.workouts);
};

const methods: Record<string, (x?: unknown) => Promise<unknown>> = {
  async getWorkouts() {
    return get();
  },
  async addPlan(w: unknown) {
    const db = get();
    if (!db.planned) {
      db.planned = [];
    }
    db.planned.push(w as any);
    flush(db);
  },
  async archive(args: unknown) {
    const db = get();
    const id = t.Record({ id: t.String }).check(args).id;
    const pos = db.workouts.findIndex((x) => x.title == id);
    if (pos < 0) {
      throw new Error(`not found`);
    }
    db.archive.push(db.workouts[pos]);
    db.workouts.splice(pos, 1);
    flush(db);
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
    return ok(await methods[method](params));
  } catch (any) {
    const e = toErr(any);
    return err(e.message);
  }
};
