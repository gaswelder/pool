import * as assert from "assert";
import { parseLine } from "./shorthand";

describe("shorthand", () => {
  it("200 medley", () => {
    assert.deepEqual(parseLine(`200 medley`), {
      repeats: 1,
      amount: 200,
      desc: "medley",
      tags: [],
    });
  });
  it("4x50 butt", () => {
    assert.deepEqual(parseLine("4x50 butt"), {
      repeats: 4,
      amount: 50,
      desc: "butt",
      tags: [],
    });
  });
  it("4x100 cr build to fast, 45 sr", () => {
    assert.deepEqual(parseLine("4x100 cr build to fast, 45 sr"), {
      repeats: 4,
      amount: 100,
      desc: "cr build to fast, 45 sr",
      tags: [],
    });
  });
  it("4x100 cr #paddles 45 sr", () => {
    assert.deepEqual(parseLine("4x100 cr #paddles 45 sr"), {
      repeats: 4,
      amount: 100,
      desc: "cr 45 sr",
      tags: ["paddles"],
    });
  });
});
