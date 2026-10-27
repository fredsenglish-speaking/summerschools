import { test } from "node:test";
import assert from "node:assert/strict";
import { bakuToday } from "./format.ts";

test("bakuToday is the date in Baku, four hours ahead of UTC", () => {
  assert.equal(bakuToday(new Date("2027-06-30T19:59:00Z")), "2027-06-30");
  assert.equal(bakuToday(new Date("2027-06-30T20:00:00Z")), "2027-07-01");
});
