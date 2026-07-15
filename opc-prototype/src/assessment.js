export const dimensions = [
  "内容能力",
  "商业判断力",
  "AI工具熟练度",
  "销售敏感度",
  "学习能力",
  "社交影响力",
];

export const categoryWeights = [
  { name: "果酒/低度酒", short: "果酒", weights: [85, 70, 60, 55, 65, 80], gate: "轻量启动", market: "250亿", growth: "18%", income: "3-8K" },
  { name: "美妆/护肤", short: "美妆", weights: [90, 80, 65, 75, 70, 85], gate: "内容专业", market: "5000亿", growth: "12%", income: "5-15K" },
  { name: "健康食品/营养师", short: "健康食品", weights: [70, 65, 55, 60, 75, 70], gate: "信任科普", market: "800亿", growth: "20%", income: "3-10K" },
  { name: "母婴用品", short: "母婴", weights: [75, 70, 55, 80, 65, 90], gate: "强信任", market: "4.5万亿", growth: "10%", income: "5-12K" },
  { name: "家居收纳/整理", short: "家居收纳", weights: [65, 60, 50, 65, 60, 75], gate: "入门友好", market: "120亿", growth: "25%", income: "3-8K" },
  { name: "女性服饰/穿搭", short: "女性服饰", weights: [85, 70, 60, 70, 65, 80], gate: "视觉表达", market: "2万亿", growth: "8%", income: "4-10K" },
  { name: "珠宝/饰品", short: "珠宝饰品", weights: [80, 75, 55, 70, 60, 85], gate: "审美种草", market: "800亿", growth: "15%", income: "4-12K" },
  { name: "女性健康/保健品", short: "女性健康", weights: [70, 75, 50, 80, 80, 70], gate: "专业门槛", market: "3000亿", growth: "18%", income: "5-15K" },
  { name: "职场工具/效率", short: "职场工具", weights: [60, 80, 90, 50, 85, 55], gate: "AI友好", market: "150亿", growth: "30%", income: "3-10K" },
  { name: "个人成长/课程", short: "个人成长", weights: [80, 85, 70, 85, 75, 80], gate: "交付要求", market: "500亿", growth: "20%", income: "5-15K" },
  { name: "亲子教育/玩具", short: "亲子教育", weights: [70, 70, 55, 75, 70, 85], gate: "场景信任", market: "500亿", growth: "12%", income: "4-10K" },
  { name: "宠物用品（女性养宠）", short: "宠物用品", weights: [75, 60, 50, 60, 60, 80], gate: "情绪价值", market: "3000亿", growth: "15%", income: "3-8K" },
  { name: "读书/知识付费", short: "读书知识", weights: [85, 80, 65, 70, 80, 75], gate: "内容沉淀", market: "500亿", growth: "22%", income: "3-10K" },
  { name: "旅行/户外（女性向）", short: "旅行户外", weights: [80, 70, 60, 65, 60, 75], gate: "生活方式", market: "200亿", growth: "18%", income: "3-8K" },
  { name: "茶饮/新式茶饮", short: "茶饮", weights: [80, 65, 55, 60, 65, 85], gate: "场景内容", market: "3000亿", growth: "15%", income: "3-8K" },
  { name: "香薰/家居香氛", short: "香薰", weights: [75, 60, 50, 55, 60, 80], gate: "低门槛", market: "80亿", growth: "28%", income: "3-8K" },
  { name: "内衣/贴身衣物", short: "内衣", weights: [70, 65, 50, 70, 60, 75], gate: "隐私信任", market: "500亿", growth: "10%", income: "4-10K" },
  { name: "银发经济（女性向）", short: "银发经济", weights: [65, 80, 55, 75, 70, 70], gate: "高增长", market: "1000亿", growth: "25%", income: "5-12K" },
];

export const commercialQuestions = [
  { dim: "内容能力", q: "当你需要公开表达一个观点时，你通常能做到什么程度？", options: ["能根据受众选择文字、图片或视频，并持续输出", "有一种较稳定的表达方式，基本能讲清楚", "偶尔能表达，但需要较多准备或协助", "主要依赖一对一沟通，很少公开表达"] },
  { dim: "内容能力", q: "你曾经创造过被很多人看到的内容吗？", options: ["有，且多次获得超出预期的互动", "有一两次，感觉还不错", "没有特别印象，可能没有", "从来没认真做过内容"] },
  { dim: "内容能力", q: "看到一个好的产品或服务，你会？", options: ["主动分享，还会附带使用感受", "私发给可能需要的朋友", "自己默默用，不主动分享", "没什么特别感觉"] },
  { dim: "商业判断力", q: "看到一个新品类产品，你的第一反应是？", options: ["这个东西卖给谁，为什么有人会买", "这个东西有意思、好看或好用", "刷过去，没什么特别感觉", "不知道这是什么"] },
  { dim: "商业判断力", q: "你有没有过早发现某个机会的经历？", options: ["有，后来验证了我的判断", "有，但没行动，后来别人做成了", "好像没有特别印象", "我对趋势不敏感"] },
  { dim: "商业判断力", q: "你觉得女性创业最大的机会在哪里？", options: ["能说清具体赛道和原因", "有大概方向，但不确定", "觉得机会很多，不知道选哪个", "没想过这个问题"] },
  { dim: "商业判断力", q: "看到一个品类，比如果酒，你怎么判断它值不值得做？", options: ["看市场规模、增速、竞争格局、消费者画像", "看身边有没有人在做、做得怎么样", "凭感觉判断好不好卖", "不懂怎么判断"] },
  { dim: "AI工具熟练度", q: "你目前使用AI工具的频率是？", options: ["每天用，已经融入工作流程", "每周用几次，处理特定任务", "试用过，但没坚持下来", "没用过，不了解"] },
  { dim: "AI工具熟练度", q: "用AI工具时，你的提示词水平是？", options: ["能写精准提示词，输出可直接用", "会改提示词，让输出更接近目标", "用默认对话，不会专门优化", "不知道提示词是什么"] },
  { dim: "AI工具熟练度", q: "你认为AI对未来收入最大的影响是？", options: ["能具体说出如何提效或创造收入", "觉得重要，也在学习怎么用", "知道重要，但还没找到场景", "AI和我没关系"] },
  { dim: "销售敏感度", q: "你有没有成功推荐过产品或服务给朋友？", options: ["有，不止一次，朋友会主动问我", "有一两次，感觉还不错", "没成功推荐过，但朋友会问建议", "没有推荐过，也不太好意思"] },
  { dim: "销售敏感度", q: "如果有人对你的推荐提出异议，你会？", options: ["理解顾虑，并给出针对性回应", "解释产品价值，但说服力一般", "不知道怎么回应，可能不说了", "对方不买就算了"] },
  { dim: "销售敏感度", q: "你觉得销售是什么？", options: ["帮对方解决问题，推荐适合的东西", "把产品卖出去，完成交易", "说服别人买他可能不需要的东西", "我不适合做销售"] },
  { dim: "学习能力", q: "学一个新工具或新技能，你的方式是？", options: ["先上手用，边用边学，快速迭代", "先看教程或文档，理解后再上手", "需要有人教，跟着做", "学新东西对我来说很困难"] },
  { dim: "学习能力", q: "过去一年，你主动学习过什么新东西？", options: ["有，且能说出学到什么、怎么用", "有开始学，但没坚持下来", "想学，但一直没开始", "过去一年没有主动学习"] },
  { dim: "社交影响力", q: "你在朋友圈或社交媒体上的状态是？", options: ["经常有人评论、点赞、私信我", "有一定互动，但不是特别多", "偶尔发，互动很少", "不怎么发朋友圈或社交媒体"] },
  { dim: "社交影响力", q: "如果朋友需要某个品类推荐，他们会想到你吗？", options: ["会，我在某些品类上有信任背书", "可能会，如果我想推荐的话", "不会特别想到我", "朋友不会找我推荐东西"] },
];

export const aiQuestions = [
  { area: "提示词库", q: "如果让你用AI搭建一条内容生产线，你现在的状态是？", options: ["已有固定提示词库，可以稳定产出内容", "会用AI写文案/做图，但流程还不稳定", "偶尔问AI几个问题，输出需要大量修改", "还不知道怎么把AI用到自己的生意里"] },
  { area: "提示词库", q: "你是否会把高频任务整理成可复用的指令？", options: ["会，并按场景分类保存", "会保存少量常用指令", "偶尔复制别人的指令", "没有这个习惯"] },
  { area: "内容生产", q: "用AI生成一篇小红书内容，你通常能做到？", options: ["选题、标题、正文、封面建议都能跑通", "能生成标题和正文，需要人工改很多", "只能让AI给一些灵感", "不知道怎么让AI写得像自己"] },
  { area: "内容生产", q: "AI图片或视频工具在你的业务里处于什么位置？", options: ["已经用于日常素材生产", "偶尔用于封面或场景图", "试过但不稳定", "还没用过"] },
  { area: "自动化流程", q: "你是否把多个工具串成过自动流程？", options: ["已经有自动化流程在跑", "搭过简单流程，但还不稳定", "知道概念，没真正做过", "完全不了解自动化"] },
  { area: "自动化流程", q: "你处理客户咨询时，AI能帮到什么程度？", options: ["常见问题已能自动回复或半自动处理", "能帮我写回复，但需要手动复制", "偶尔用AI润色话术", "完全人工处理"] },
  { area: "私域工具", q: "你的客户信息现在如何沉淀？", options: ["有标签、分层和跟进节奏", "有表格或工具记录一部分", "主要靠聊天记录和记忆", "还没有私域客户"] },
  { area: "私域工具", q: "你是否有固定的话术库或案例库？", options: ["有，并能按场景快速调用", "有一些，但不系统", "零散存在聊天记录里", "没有"] },
  { area: "数据复盘", q: "发布内容后，你会如何复盘？", options: ["看数据并调整选题、标题、发布时间", "大概看一下点赞评论", "只凭感觉判断好不好", "基本不复盘"] },
  { area: "数据复盘", q: "如果要比较三个品类机会，你会怎么做？", options: ["用AI+数据工具做表格和结论", "手动搜资料再判断", "问朋友或看谁做得多", "不知道怎么比较"] },
  { area: "工具成本", q: "面对一个新AI工具，你会先看什么？", options: ["它能替代哪个岗位或流程", "它是否好上手、是否便宜", "别人有没有推荐", "名字看起来熟不熟"] },
  { area: "工具成本", q: "你现在最需要AI替你解决什么？", options: ["把重复工作变成流程", "提高内容产出速度", "帮我写文案和话术", "还不清楚自己的需求"] },
];

export const levelMap = [
  { min: 0, max: 9, level: "L1", name: "机会发现者", desc: "你正在探索AI商业世界。最好的开始，就是现在。" },
  { min: 10, max: 24, level: "L2", name: "AI实战新手", desc: "你已经有了AI基础。现在是时候用它来赚钱了。" },
  { min: 25, max: 34, level: "L3", name: "品类分析师", desc: "你已经能看到商业机会了。下一步不是学更多，是选对一个品类。" },
  { min: 35, max: 44, level: "L4", name: "项目执行者", desc: "你的能力组合已经可以启动商业项目。推荐品类已就绪。" },
  { min: 45, max: 59, level: "L5", name: "应用构建者", desc: "你的能力组合已较完整。现在是聚焦一个方向并开始验证的时候。" },
  { min: 60, max: 74, level: "L6", name: "商业闭环者", desc: "你的商业潜力较强，下一步要用真实项目验证并补齐闭环。" },
  { min: 75, max: 84, level: "L7", name: "品类领导者", desc: "你具备建立品类竞争优势和系统化收入的潜力。" },
  { min: 85, max: 94, level: "L8", name: "生态构建者", desc: "你具备把OPC沉淀为可复制系统并赋能他人的潜力。" },
  { min: 95, max: 100, level: "L9", name: "商业导师", desc: "你具备把经验系统化并形成他人可执行路径的潜力。" },
];

export const dimensionMeta = {
  内容能力: { full: 12, weight: 0.25 },
  商业判断力: { full: 16, weight: 0.25 },
  AI工具熟练度: { full: 12, weight: 0.15 },
  销售敏感度: { full: 12, weight: 0.15 },
  学习能力: { full: 8, weight: 0.1 },
  社交影响力: { full: 8, weight: 0.1 },
};

export const aiAreas = ["提示词库", "内容生产", "自动化流程", "私域工具", "数据复盘", "工具成本"];

export function scoreFromOption(optionIndex) {
  return [4, 3, 2, 1][optionIndex] ?? null;
}

export function fallbackAnswers(questions) {
  return questions.map((_, index) => index % 4 === 0 ? 0 : index % 3 === 0 ? 2 : 1);
}

export function isAssessmentComplete(answers, questions) {
  return Array.isArray(answers)
    && answers.length === questions.length
    && answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3);
}

function normalizedPercent(raw, answeredCount) {
  if (!answeredCount) return 0;
  const minimum = answeredCount;
  const range = answeredCount * 3;
  return Math.round(((raw - minimum) / range) * 100);
}

export function calculateBusiness(answers = []) {
  const raw = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));
  const counts = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));

  commercialQuestions.forEach((question, index) => {
    const score = scoreFromOption(answers[index]);
    if (score === null) return;
    raw[question.dim] += score;
    counts[question.dim] += 1;
  });

  const percentScores = Object.fromEntries(dimensions.map((dimension) => (
    [dimension, normalizedPercent(raw[dimension], counts[dimension])]
  )));
  const activeDimensions = dimensions.filter((dimension) => counts[dimension] > 0);
  const activeWeight = activeDimensions.reduce((sum, dimension) => sum + dimensionMeta[dimension].weight, 0);
  const totalScore = activeWeight
    ? Math.round(activeDimensions.reduce((sum, dimension) => (
      sum + percentScores[dimension] * dimensionMeta[dimension].weight
    ), 0) / activeWeight)
    : 0;
  const level = levelMap.find((item) => totalScore >= item.min && totalScore <= item.max) ?? levelMap[0];
  const rankedDimensions = activeDimensions.length ? activeDimensions : dimensions;
  const strongestDim = rankedDimensions.reduce((top, dimension) => (
    percentScores[dimension] > percentScores[top] ? dimension : top
  ), rankedDimensions[0]);
  const weakestDim = rankedDimensions.reduce((low, dimension) => (
    percentScores[dimension] < percentScores[low] ? dimension : low
  ), rankedDimensions[0]);

  const categoryMatches = categoryWeights
    .map((category, sourceIndex) => {
      const totalWeight = activeDimensions.reduce((sum, dimension) => (
        sum + category.weights[dimensions.indexOf(dimension)]
      ), 0);
      const weightedScore = activeDimensions.reduce((sum, dimension) => {
        const dimensionIndex = dimensions.indexOf(dimension);
        return sum + (percentScores[dimension] / 100) * category.weights[dimensionIndex];
      }, 0);
      return {
        ...category,
        match: totalWeight ? Math.round((weightedScore / totalWeight) * 100) : 0,
        sourceIndex,
      };
    })
    .sort((left, right) => right.match - left.match || left.sourceIndex - right.sourceIndex)
    .map(({ sourceIndex, ...category }) => category);

  return {
    raw,
    counts,
    percentScores,
    totalScore,
    level,
    strongestDim,
    weakestDim,
    recommendedCategories: categoryMatches.slice(0, 3),
    categoryMatches,
    answeredCount: counts && Object.values(counts).reduce((sum, count) => sum + count, 0),
    complete: isAssessmentComplete(answers, commercialQuestions),
  };
}

export function calculateAi(answers = []) {
  const raw = Object.fromEntries(aiAreas.map((area) => [area, 0]));
  const counts = Object.fromEntries(aiAreas.map((area) => [area, 0]));
  aiQuestions.forEach((question, index) => {
    const score = scoreFromOption(answers[index]);
    if (score === null) return;
    raw[question.area] += score;
    counts[question.area] += 1;
  });
  const percent = Object.fromEntries(aiAreas.map((area) => [area, normalizedPercent(raw[area], counts[area])]));
  const activeAreas = aiAreas.filter((area) => counts[area] > 0);
  const rankedAreas = activeAreas.length ? activeAreas : aiAreas;
  const weakest = rankedAreas.reduce((low, area) => percent[area] < percent[low] ? area : low, rankedAreas[0]);
  const strongest = rankedAreas.reduce((top, area) => percent[area] > percent[top] ? area : top, rankedAreas[0]);
  const total = activeAreas.length
    ? Math.round(activeAreas.reduce((sum, area) => sum + percent[area], 0) / activeAreas.length)
    : 0;
  return {
    areas: aiAreas,
    raw,
    counts,
    percent,
    weakest,
    strongest,
    total,
    answeredCount: Object.values(counts).reduce((sum, count) => sum + count, 0),
    complete: isAssessmentComplete(answers, aiQuestions),
  };
}

export function creditScore(business) {
  return Math.min(960, Math.max(520, Math.round(520 + business.totalScore * 4)));
}
