import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getEnglishFallbackReply,
  getStressRecommendations,
  WELLNESS_ACTIVITIES,
  WELLNESS_GAMES,
} from "../lib/wellnessRecommendations";

test("maps ST-5 score boundaries to the requested activity groups", () => {
  assert.deepEqual(getStressRecommendations(0)?.activityIds, [
    "music",
    "walking",
    "gratitude",
    "drawing",
  ]);
  assert.deepEqual(getStressRecommendations(4)?.activityIds, [
    "music",
    "walking",
    "gratitude",
    "drawing",
  ]);
  assert.deepEqual(getStressRecommendations(5)?.activityIds, [
    "breathing",
    "stretching",
    "music",
    "journaling",
    "meditation",
  ]);
  assert.deepEqual(getStressRecommendations(7)?.activityIds, [
    "breathing",
    "stretching",
    "music",
    "journaling",
    "meditation",
  ]);
  assert.deepEqual(getStressRecommendations(8)?.activityIds, [
    "breathing",
    "muscle-relaxation",
    "meditation",
    "trusted-person",
  ]);
  assert.deepEqual(getStressRecommendations(9)?.activityIds, [
    "breathing",
    "muscle-relaxation",
    "meditation",
    "trusted-person",
  ]);
  assert.deepEqual(getStressRecommendations(10)?.activityIds, [
    "breathing",
    "grounding",
    "trusted-person",
  ]);
  assert.equal(getStressRecommendations(10)?.professionalSupport, true);
  assert.deepEqual(getStressRecommendations(15)?.activityIds, [
    "breathing",
    "grounding",
    "trusted-person",
  ]);
});

test("rejects scores outside ST-5 and keeps every recommended activity available", () => {
  assert.equal(getStressRecommendations(-1), null);
  assert.equal(getStressRecommendations(16), null);
  assert.equal(getStressRecommendations(5.5), null);

  for (const score of [0, 5, 8, 10]) {
    const band = getStressRecommendations(score);
    assert.ok(band);

    for (const id of band.activityIds) {
      assert.ok(WELLNESS_ACTIVITIES.some((activity) => activity.id === id), id);
    }
  }
});

test("provides all three wellness games", () => {
  assert.equal(WELLNESS_GAMES.length, 3);
  assert.ok(WELLNESS_GAMES.every((game) => game.href));
});

test("English fallback responds to the assessment instead of using a generic thank-you", () => {
  const greeting = getEnglishFallbackReply({
    messages: [{ role: "user", content: "I completed my assessment" }],
    assessment: { score: 11 },
    assessmentGreeting: true,
  });
  assert.match(greeting.reply, /11\/15/);
  assert.match(greeting.reply, /not a diagnosis/);
  assert.match(greeting.reply, /How have you been feeling/);

  const recommendations = getEnglishFallbackReply({
    messages: [{ role: "user", content: "I want to try an activity" }],
    assessment: { score: 8 },
    recommendationsReady: true,
  });
  assert.match(recommendations.reply, /Breathing exercise/);
  assert.match(recommendations.reply, /Muscle relaxation/);
  assert.doesNotMatch(recommendations.reply, /^Thank you for sharing/);
});

test("English fallback follows the conversation topic and preserves safety responses", () => {
  const schoolReply = getEnglishFallbackReply({
    messages: [{ role: "user", content: "I'm overwhelmed by homework" }],
    topic: "school",
  });
  assert.match(schoolReply.reply, /School/);
  assert.match(schoolReply.reply, /workload/);

  const crisisReply = getEnglishFallbackReply({
    messages: [{ role: "user", content: "I feel unsafe" }],
    risk: "crisis",
    assessment: { score: 12 },
    recommendationsReady: true,
  });
  assert.equal(crisisReply.risk, "crisis");
  assert.match(crisisReply.reply, /1669/);
  assert.doesNotMatch(crisisReply.reply, /Based on your ST-5/);
});
