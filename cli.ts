import { sst } from "./src/backend/sets";

const days = sst();

const tab = "  ";
const tab2 = "    ";

for (const day of days) {
  console.log(day.title);
  for (const set of day.sets) {
    console.log(tab, set.title);
    for (const el of set.elements) {
      console.log(tab2, el.line);
      el.comments.forEach((x) => {
        console.log(tab2, x);
      });
      el.history.forEach((x) => {
        console.log(tab2, x);
      });
    }
  }
  console.log("\n");
}
