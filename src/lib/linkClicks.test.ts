import test from "node:test";
import assert from "node:assert/strict";

import { formatLinkCount, normalizeLinkCounts } from "./linkClicks";

test("normalizeLinkCounts fills missing ids with zero", () => {
  const counts = normalizeLinkCounts({ github: 12 });

  assert.equal(counts.github, 12);
  assert.equal(counts.blog, 0);
  assert.equal(counts.email, 0);
});

test("formatLinkCount appends Korean click suffix", () => {
  assert.equal(formatLinkCount(0), "0회");
  assert.equal(formatLinkCount(42), "42회");
});
