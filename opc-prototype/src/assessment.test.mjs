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
import { aiToolCatalog } from "./aiTools.js";
import { countUniqueUsers, publicRecordForUser } from "./recordAccess.js";
import {
  aiSolutions,
  buildCategoryRationales,
  getAiSolution,
  getLevelGrowthPlan,
} from "./resultLogic.js";

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

test("each OPC level points to the correct next level without regression", () => {
  levelMap.forEach((level, index) => {
    const plan = getLevelGrowthPlan(level.level);
    const expectedNext = levelMap[index + 1]?.level ?? null;
    assert.equal(plan.next, expectedNext);
    assert.ok(plan.objective.length > 6);
    assert.equal(plan.steps.length, 4);
    if (expectedNext) assert.equal(plan.steps.at(-1), `升级${expectedNext}`);
  });
  assert.equal(getLevelGrowthPlan("L7").next, "L8");
});

test("every AI weakness has a concrete solution and matching tools", () => {
  assert.deepEqual(Object.keys(aiSolutions), ["提示词库", "内容生产", "自动化流程", "私域工具", "数据复盘", "工具成本"]);
  Object.entries(aiSolutions).forEach(([area, solution]) => {
    assert.equal(getAiSolution(area), solution);
    assert.ok(solution.title.length >= 8);
    assert.ok(solution.summary.length >= 20);
    assert.ok(solution.action.length >= 15);
    assert.ok(solution.toolIds.length >= 2);
    solution.toolIds.forEach((id) => assert.ok(aiToolCatalog.some((tool) => tool.id === id)));
  });
});

test("AI tool catalog uses unique official HTTPS links and covers all areas", () => {
  assert.equal(new Set(aiToolCatalog.map((tool) => tool.id)).size, aiToolCatalog.length);
  aiToolCatalog.forEach((tool) => {
    assert.match(tool.url, /^https:\/\//);
    assert.ok(tool.areas.length > 0);
  });
  Object.keys(aiSolutions).forEach((area) => {
    assert.ok(aiToolCatalog.some((tool) => tool.areas.includes(area)), `${area} should have at least one tool`);
  });
});

test("Top3 rationale is derived from the same weighted category result", () => {
  const business = calculateBusiness(commercialQuestions.map((_, index) => index % 4));
  const ai = calculateAi(aiQuestions.map((_, index) => index % 4));
  const rationales = buildCategoryRationales(business, ai);
  assert.equal(rationales.length, 3);
  rationales.forEach((item, index) => {
    assert.equal(item.name, business.recommendedCategories[index].name);
    assert.equal(item.match, business.recommendedCategories[index].match);
    assert.equal(item.drivers.length, 2);
    assert.match(item.reason, /主要贡献项/);
  });
});

test("user records never expose private CRM fields", () => {
  const business = calculateBusiness(commercialQuestions.map(() => 0));
  const ai = calculateAi(aiQuestions.map(() => 0));
  const base = {
    id: "record-1",
    assessmentType: "opc",
    reportUnlocked: true,
    status: "已联系",
    owner: "Advisor",
    source: "后台来源",
    note: "内部跟进备注",
    unlockedBy: "超级管理员",
    businessResult: business,
    aiResult: ai,
    businessAnswers: commercialQuestions.map(() => 0),
    aiAnswers: aiQuestions.map(() => 0),
  };
  const unlocked = publicRecordForUser(base);
  ["status", "owner", "source", "note", "unlockedBy"].forEach((field) => {
    assert.equal(Object.prototype.hasOwnProperty.call(unlocked, field), false);
  });
  assert.equal(unlocked.businessResult.percentScores[dimensions[0]], 100);

  const locked = publicRecordForUser({ ...base, reportUnlocked: false });
  assert.equal(Object.prototype.hasOwnProperty.call(locked.businessResult, "percentScores"), false);
  assert.deepEqual(locked.businessAnswers, []);
  assert.deepEqual(locked.aiAnswers, []);
});

test("high-intent totals count unique users instead of assessment rows", () => {
  const records = [
    { id: "a", userId: "user-1", phone: "13800000001" },
    { id: "b", userId: "user-1", phone: "13800000001" },
    { id: "c", userId: "user-2", phone: "13800000002" },
    { id: "d", phone: "13800000003" },
    { id: "e", phone: "13800000003" },
  ];
  assert.equal(countUniqueUsers(records), 3);
});
