import { test } from "node:test";
import assert from "node:assert/strict";
import { isListed, linesToList, localText, matches, parseSearch, slugify, sortForListing, type School } from "./schools.ts";

function school(over: Partial<School> = {}): School {
  return {
    id: "1",
    slug: "london",
    published: true,
    country: "uk",
    age_min: 10,
    age_max: 16,
    duration_weeks: 2,
    price: 2500,
    currency: "GBP",
    main_photo: null,
    gallery: [],
    tier: "standard",
    organizer: "",
    paid_until: null,
    i18n: {},
    created_at: "2026-10-01T00:00:00Z",
    ...over,
  };
}

test("parseSearch keeps only values the form can send", () => {
  assert.deepEqual(parseSearch({ age: "12", duration: "2", country: "uk" }), { age: 12, duration: "2", country: "uk" });
  assert.deepEqual(parseSearch({ age: "abc", duration: "9", country: "mars" }), { age: null, duration: "all", country: "all" });
  assert.deepEqual(parseSearch({}), { age: null, duration: "all", country: "all" });
});

test("matches checks the age range, duration and country", () => {
  const s = school();
  assert.ok(matches(s, { age: 10, duration: "all", country: "all" }));
  assert.ok(matches(s, { age: 16, duration: "2", country: "uk" }));
  assert.ok(!matches(s, { age: 9, duration: "all", country: "all" }));
  assert.ok(!matches(s, { age: null, duration: "1", country: "all" }));
  assert.ok(!matches(s, { age: null, duration: "all", country: "tr" }));
  assert.ok(matches(school({ duration_weeks: 4 }), { age: null, duration: "3", country: "all" }));
  assert.ok(!matches(school({ duration_weeks: 2 }), { age: null, duration: "3", country: "all" }));
});

test("isListed hides drafts and expired placements", () => {
  assert.ok(isListed(school(), "2027-01-01"));
  assert.ok(isListed(school({ paid_until: "2027-01-01" }), "2027-01-01"));
  assert.ok(!isListed(school({ paid_until: "2026-12-31" }), "2027-01-01"));
  assert.ok(!isListed(school({ published: false }), "2027-01-01"));
});

test("sortForListing puts premium, then top first", () => {
  const list = sortForListing([
    school({ id: "a", tier: "standard", created_at: "2026-10-05" }),
    school({ id: "b", tier: "top" }),
    school({ id: "c", tier: "premium" }),
    school({ id: "d", tier: "standard", created_at: "2026-10-09" }),
  ]);
  assert.deepEqual(list.map((s) => s.id), ["c", "b", "d", "a"]);
});

test("localText falls back to another language field by field", () => {
  const s = school({ i18n: { az: { title: "Yay məktəbi", included: ["Dərslər"] }, en: { title: "Summer school", meals: "3 meals" } } });
  const en = localText(s, "en");
  assert.equal(en.title, "Summer school");
  assert.equal(en.meals, "3 meals");
  assert.deepEqual(en.included, ["Dərslər"]);
  assert.equal(localText(s, "ru").title, "Yay məktəbi");
  assert.equal(localText(s, "ru").room, "");
});

test("slugify turns Azerbaijani titles into Latin URLs", () => {
  assert.equal(slugify("İngilis dili yay məktəbi"), "ingilis-dili-yay-mektebi");
  assert.equal(slugify("  Çin, Pekin — 2027! "), "cin-pekin-2027");
});

test("linesToList drops bullets and blank lines", () => {
  assert.deepEqual(linesToList("- Dərslər\n\n• Yaşayış\r\n  Transfer  "), ["Dərslər", "Yaşayış", "Transfer"]);
});
