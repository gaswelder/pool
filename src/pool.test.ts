import chai from "chai";
import * as fs from "fs";
import { parseDraft, parseJSONWorkout, workoutVolume } from "./parser/parser";

const assert = chai.assert;

describe("parser", () => {
  const db = JSON.parse(fs.readFileSync("data/pool.json").toString());
  db.workouts.forEach((w: any) => {
    it(w.title, () => {
      parseJSONWorkout(w);
    });
  });

  it("200 medley", () => {
    assert.deepEqual(parseDraft(`200 medley`).result, [
      {
        name: "",
        repeats: 1,
        ex: [
          {
            repeats: 1,
            amount: 200,
            desc: "medley",
            equipment: [],
          },
        ],
      },
    ]);
  });
  it("4x50 butt", () => {
    assert.deepEqual(parseDraft("4x50 butt").result, [
      {
        name: "",
        repeats: 1,
        ex: [
          {
            repeats: 4,
            amount: 50,
            desc: "butt",
            equipment: [],
          },
        ],
      },
    ]);
  });
  it("3 x (50 3 kick 1 pull butt + 50 3k1p br + 100 cr)", () => {
    assert.deepEqual(
      parseDraft("3 x (50 3 kick 1 pull butt + 50 3k1p br + 100 cr)").result,
      [
        {
          name: "",
          repeats: 3,
          ex: [
            {
              repeats: 1,
              amount: 50,
              desc: "3 kick 1 pull butt",
              equipment: [],
            },
            {
              repeats: 1,
              amount: 50,
              desc: "3k1p br",
              equipment: [],
            },
            {
              repeats: 1,
              amount: 100,
              desc: "cr",
              equipment: [],
            },
          ],
        },
      ]
    );
  });
  it("4x100 cr build to fast, 45 sr", () => {
    assert.deepEqual(parseDraft("4x100 cr build to fast, 45 sr").result, [
      {
        name: "",
        repeats: 1,
        ex: [
          {
            repeats: 4,
            amount: 100,
            desc: "cr build to fast, 45 sr",
            equipment: [],
          },
        ],
      },
    ]);
  });
  it("4x100 cr #paddles 45 sr", () => {
    assert.deepEqual(parseDraft("4x100 cr #paddles 45 sr").result, [
      {
        name: "",
        repeats: 1,
        ex: [
          { repeats: 4, amount: 100, desc: "cr 45 sr", equipment: ["paddles"] },
        ],
      },
    ]);
  });

  it("draft", () => {
    assert.deepEqual(
      parseDraft(`
      -- main
      4 x 50 cr`),
      {
        errors: [],
        result: [
          {
            repeats: 1,
            name: "main",
            ex: [{ repeats: 4, amount: 50, desc: "cr", equipment: [] }],
          },
        ],
      }
    );
  });

  it("draft", () => {
    assert.deepEqual(
      parseDraft(`
      -- 4 x main
      4 x 50 cr`),
      {
        errors: [],
        result: [
          {
            name: "main",
            repeats: 4,
            ex: [{ repeats: 4, amount: 50, desc: "cr", equipment: [] }],
          },
        ],
      }
    );
  });

  it("draft 3", () => {
    const { result } = parseDraft(`
    600 cr
    4 x (25 dol + 25 dive)
    600 cr`);
    assert.deepEqual(result, [
      {
        name: "",
        repeats: 1,
        ex: [
          {
            repeats: 1,
            amount: 600,
            desc: "cr",
            equipment: [],
          },
        ],
      },
      {
        name: "",
        repeats: 4,
        ex: [
          {
            repeats: 1,
            amount: 25,
            desc: "dol",
            equipment: [],
          },
          {
            repeats: 1,
            amount: 25,
            desc: "dive",
            equipment: [],
          },
        ],
      },
      {
        name: "",
        repeats: 1,
        ex: [
          {
            repeats: 1,
            amount: 600,
            desc: "cr",
            equipment: [],
          },
        ],
      },
    ]);
  });

  it("volume", () => {
    const { result, errors } = parseDraft(`
      3 x (50 3 kick 1 pull butt + 50 3k1p br + 100 cr)
      3 x (25 fast cr + 25 rest + 25 fast br + 25 rest)`);
    for (const e of errors) {
      throw e;
    }
    assert.equal(
      workoutVolume(result),
      3 * (50 + 50 + 100) + 3 * (25 + 25 + 25 + 25)
    );
  });

  it("volume", () => {
    const { result, errors } = parseDraft(`
    -- 12 x main
      50 3 kick 1 pull butt
      50 3k1p br
      100 cr
      25 fast cr
      25 rest
      25 fast br
      25 rest`);
    for (const e of errors) {
      throw e;
    }
    assert.equal(
      workoutVolume(result),
      4 * (3 * (50 + 50 + 100) + 3 * (25 + 25 + 25 + 25))
    );
  });
});
