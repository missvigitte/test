export const aiSolutions = {
  "提示词库": {
    title: "建立可复用的提示词资产",
    summary: "先固定角色、任务、输入材料和输出格式，再把有效指令按内容、销售和复盘场景归档。",
    action: "本周选择一个高频任务，连续复用同一条提示词三次，并记录每次修改。",
    toolIds: ["kimi", "deepseek", "doubao"],
  },
  "内容生产": {
    title: "搭建一条轻量内容生产线",
    summary: "把选题、初稿、视觉素材、剪辑和发布拆成固定步骤，减少每次从零开始。",
    action: "先完成一套选题表、正文模板和封面模板，用同一流程发布三条内容。",
    toolIds: ["canva", "capcut", "kimi"],
  },
  "自动化流程": {
    title: "把重复动作连接成流程",
    summary: "先从资料收集、内容整理或客户跟进中的一个重复环节开始，用触发器和模板减少手动搬运。",
    action: "画出当前流程，标出最重复的一步，并做一个能稳定运行的最小自动化。",
    toolIds: ["coze", "feishu-base", "wps-ai"],
  },
  "私域工具": {
    title: "建立客户分层与跟进节奏",
    summary: "统一客户标签、需求阶段、沟通记录和下次跟进时间，让线索不再只留在聊天记录里。",
    action: "先建立三层客户标签，并为每层准备一条欢迎、跟进和成交后的标准话术。",
    toolIds: ["wecom", "weiban", "feishu-base"],
  },
  "数据复盘": {
    title: "用数据决定下一轮动作",
    summary: "固定记录曝光、互动、咨询、成交和复购，按周比较内容与品类表现。",
    action: "建立一张周复盘表，只保留五个关键指标，并写下一个继续和一个停止动作。",
    toolIds: ["feishu-base", "wps-ai", "deepseek"],
  },
  "工具成本": {
    title: "建立工具投入产出清单",
    summary: "不按热度购买工具，而是记录它替代的步骤、节省的时间、使用频率和真实产出。",
    action: "连续七天记录工具使用次数与节省时间，保留高频工具，停掉没有稳定场景的订阅。",
    toolIds: ["deepseek", "kimi", "canva"],
  },
};

export const levelGrowthPlans = {
  L1: { next: "L2", objective: "完成第一次AI商业实战", steps: ["确定一个真实任务", "学会基础提示词", "完成一次公开输出", "升级L2"] },
  L2: { next: "L3", objective: "从会用工具走向会看机会", steps: ["固定一个AI场景", "收集三个品类样本", "完成一次机会比较", "升级L3"] },
  L3: { next: "L4", objective: "选择一个品类并启动验证", steps: ["锁定核心人群", "提炼高频需求", "设计最小方案", "升级L4"] },
  L4: { next: "L5", objective: "把项目做成可重复的应用", steps: ["完成首轮执行", "记录交付步骤", "复盘客户反馈", "升级L5"] },
  L5: { next: "L6", objective: "建立从获客到交付的商业闭环", steps: ["稳定内容入口", "验证成交话术", "固化交付流程", "升级L6"] },
  L6: { next: "L7", objective: "形成明确的品类竞争优势", steps: ["聚焦高匹配品类", "建立代表案例", "提升复购与转介绍", "升级L7"] },
  L7: { next: "L8", objective: "把品类优势沉淀成可复制生态", steps: ["固化品类方法论", "搭建内容与成交SOP", "建立伙伴协作机制", "升级L8"] },
  L8: { next: "L9", objective: "把系统能力升级为行业影响力", steps: ["验证复制模型", "培养协作伙伴", "输出行业标准", "升级L9"] },
  L9: { next: null, objective: "持续放大方法论与行业影响力", steps: ["迭代商业方法论", "建立导师型产品", "共建行业生态", "形成长期资产"] },
};

export function getAiSolution(area) {
  return aiSolutions[area] ?? aiSolutions["自动化流程"];
}

export function getLevelGrowthPlan(level) {
  return levelGrowthPlans[level] ?? levelGrowthPlans.L1;
}

export function buildCategoryRationales(business, ai) {
  return business.recommendedCategories.map((category, index) => {
    const dimensions = Object.keys(business.percentScores);
    const drivers = dimensions
      .map((dimension, dimIndex) => ({
        dimension,
        contribution: Math.round((business.percentScores[dimension] / 100) * category.weights[dimIndex]),
      }))
      .sort((left, right) => right.contribution - left.contribution)
      .slice(0, 2);
    return {
      ...category,
      rank: index + 1,
      drivers,
      reason: `${drivers.map((item) => item.dimension).join(" + ")}是该赛道匹配度的主要贡献项。${getAiSolution(ai.weakest).title}后，更容易把优势转成稳定交付。`,
    };
  });
}

export function buildBespokeRoute(business, ai) {
  const primary = business.recommendedCategories[0];
  const growthPlan = getLevelGrowthPlan(business.level.level);
  const aiSolution = getAiSolution(ai.weakest);
  return [
    {
      period: "第1周",
      title: "定位校准",
      text: `以${primary.name}为主攻方向，拆出1类核心人群、3个高频场景和1个可验证卖点。`,
      output: "人群画像 + 首批选题",
    },
    {
      period: "第2周",
      title: "信任资产",
      text: `放大${business.strongestDim}，把你的经验、审美或判断转成可连续发布的内容栏目。`,
      output: "10篇内容 + 3个案例",
    },
    {
      period: "第3周",
      title: "AI流程补齐",
      text: `${aiSolution.summary}${aiSolution.action}`,
      output: "提示词库 + SOP",
    },
    {
      period: "第4周",
      title: growthPlan.next ? `向${growthPlan.next}验证` : "方法论沉淀",
      text: `${growthPlan.objective}，用咨询量、转化率和复购意愿决定下一轮投入。`,
      output: growthPlan.next ? `阶段复盘 + ${growthPlan.next}升级证据` : "行业方法论 + 生态计划",
    },
  ];
}
