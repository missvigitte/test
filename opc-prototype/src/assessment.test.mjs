import assert from "node:assert/strict";
import test from "node:test";
import {
  aiQuestions,
  calculateAi,
  calculateBusiness,
  categoryWeights,
  commercialQuestions,
  dimensionMeta,
  dimensions,
  isAssessmentComplete,
  levelMap,
} from "./assessment.js";

test("assessment configuration is internally consistent", () => {
  assert.equal(commercialQuestions.length, 17);
  assert.equal(aiQuestions.length, 12);
  assert.equal(categoryWeights.length, 18);
  assert.equal(dimensions.reduce((sum, dimension) => sum + dimensionMeta[dimension].weight, 0), 1);

  dimensions.forEach((dimension) => {
    const questionCount = commercialQuestions.filter((question) => question.dim === dimension).length;
    assert.equal(dimensionMeta[dimension].full, questionCount * 4);
  });
  categoryWeights.forEach((category) => {
    assert.equal(category.weights.length, dimensions.length);
    category.weights.forEach((weight) => assert.ok(weight >= 0 && weight <= 100));
  });
  levelMap.forEach((level, index) => {
    if (index === 0) assert.equal(level.min, 0);
    else assert.equal(level.min, levelMap[index - 1].max + 1);
  });
  assert.equal(levelMap.at(-1).max, 100);
});

test("business score spans the full L1-L9 range", () => {
  const lowest = calculateBusiness(commercialQuestions.map(() => 3));
  const lowerMiddle = calculateBusiness(commercialQuestions.map(() => 2));
  const upperMiddle = calculateBusiness(commercialQuestions.map(() => 1));
  const highest = calculateBusiness(commercialQuestions.map(() => 0));

  assert.deepEqual([lowest.totalScore, lowest.level.level], [0, "L1"]);
  assert.deepEqual([lowerMiddle.totalScore, lowerMiddle.level.level], [33, "L3"]);
  assert.deepEqual([upperMiddle.totalScore, upperMiddle.level.level], [67, "L6"]);
  assert.deepEqual([highest.totalScore, highest.level.level], [100, "L9"]);
});

test("AI score uses the same zero-to-one-hundred normalization", () => {
  assert.equal(calculateAi(aiQuestions.map(() => 3)).total, 0);
  assert.equal(calculateAi(aiQuestions.map(() => 0)).total, 100);
});

test("missing and invalid answers are never treated as completed answers", () => {
  const partial = calculateBusiness([0]);
  assert.equal(partial.answeredCount, 1);
  assert.equal(partial.complete, false);
  assert.equal(isAssessmentComplete([0], commercialQuestions), false);
  assert.equal(isAssessmentComplete(commercialQuestions.map(() => 4), commercialQuestions), false);
  assert.equal(isAssessmentComplete(commercialQuestions.map(() => 0), commercialQuestions), true);
});

test("category recommendations are bounded, sorted and unique", () => {
  const answers = commercialQuestions.map((question) => (
    ["商业判断力", "AI工具熟练度", "学习能力"].includes(question.dim) ? 0 : 3
  ));
  const result = calculateBusiness(answers);
  assert.equal(result.recommendedCategories[0].name, "职场工具/效率");
  assert.equal(new Set(result.recommendedCategories.map((category) => category.name)).size, 3);
  result.categoryMatches.forEach((category, index) => {
    assert.ok(category.match >= 0 && category.match <= 100);
    const weightedScore = dimensions.reduce((sum, dimension, dimensionIndex) => (
      sum + (result.percentScores[dimension] / 100) * category.weights[dimensionIndex]
    ), 0);
    const expectedMatch = Math.round((weightedScore / category.weights.reduce((sum, weight) => sum + weight, 0)) * 100);
    assert.equal(category.match, expectedMatch);
    if (index) assert.ok(result.categoryMatches[index - 1].match >= category.match);
  });
});

test("improving any answer cannot reduce the business score", () => {
  let seed = 20260714;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let sample = 0; sample < 500; sample += 1) {
    const answers = commercialQuestions.map(() => Math.floor(random() * 4));
    const baseline = calculateBusiness(answers).totalScore;
    answers.forEach((answer, index) => {
      if (answer === 0) return;
      const improved = [...answers];
      improved[index] = answer - 1;
      assert.ok(calculateBusiness(improved).totalScore >= baseline);
    });
  }
});
