import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChartLineUp,
  Check,
  CheckCircle,
  Compass,
  Copy,
  DownloadSimple,
  Eye,
  FunnelSimple,
  MagicWand,
  MagnifyingGlass,
  List,
  ShieldCheck,
  SignOut,
  Target,
  Trash,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import atelierPaperTransition from "./assets/atelier-paper-transition.jpg";
import dustyBlushPaper from "./assets/dusty-blush-paper.jpg";
import fruitWineWave from "./assets/fruit-wine-wave.webp";
import oxbloodVelvet from "./assets/oxblood-velvet.jpg";
import tzhTransitionReference from "./assets/tzh-transition-reference.webp";

const dimensions = [
  "内容能力",
  "商业判断力",
  "AI工具熟练度",
  "销售敏感度",
  "学习能力",
  "社交影响力",
];

const categoryWeights = [
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
  { name: "内衣/贴身衣物", short: "内衣", weights: [70, 65, 50, 70, 60, 75], gate: "隐私信任", market: "1500亿", growth: "10%", income: "4-10K" },
  { name: "银发经济（女性向）", short: "银发经济", weights: [65, 80, 55, 75, 70, 70], gate: "高增长", market: "1000亿", growth: "25%", income: "5-12K" },
];

const commercialQuestions = [
  { dim: "内容能力", q: "你平时最喜欢哪种表达方式？", options: ["写文字，能把想法讲清楚", "拍图片或做图，擅长视觉表达", "拍视频或剪辑，愿意出镜/表达", "不太擅长表达，更多是直接沟通"] },
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

const aiQuestions = [
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

const levelMap = [
  { min: 0, max: 9, level: "L1", name: "机会发现者", desc: "你正在探索AI商业世界。最好的开始，就是现在。" },
  { min: 10, max: 24, level: "L2", name: "AI实战新手", desc: "你已经有了AI基础。现在是时候用它来赚钱了。" },
  { min: 25, max: 34, level: "L3", name: "品类分析师", desc: "你已经能看到商业机会了。下一步不是学更多，是选对一个品类。" },
  { min: 35, max: 44, level: "L4", name: "项目执行者", desc: "你的能力组合已经可以启动商业项目。推荐品类已就绪。" },
  { min: 45, max: 59, level: "L5", name: "应用构建者", desc: "你有完整的商业执行能力。现在是聚焦和放大的时候。" },
  { min: 60, max: 74, level: "L6", name: "商业闭环者", desc: "你的商业潜力已经验证。下一步是选择，不是能力。" },
  { min: 75, max: 84, level: "L7", name: "品类领导者", desc: "你在某个品类已经建立了竞争优势和系统化的收入。" },
  { min: 85, max: 94, level: "L8", name: "生态构建者", desc: "你已经从OPC进化到可复制的系统，可以赋能更多人。" },
  { min: 95, max: 100, level: "L9", name: "商业导师", desc: "你的经验和系统已经成为他人成功的路径。" },
];

const dimensionMeta = {
  内容能力: { full: 12, weight: 0.25 },
  商业判断力: { full: 16, weight: 0.25 },
  AI工具熟练度: { full: 12, weight: 0.15 },
  销售敏感度: { full: 12, weight: 0.15 },
  学习能力: { full: 8, weight: 0.1 },
  社交影响力: { full: 8, weight: 0.1 },
};

const stepLabels = [
  { key: "business", label: "商业潜力测评", desc: "17题六维能力" },
  { key: "ai", label: "AI工具能力测评", desc: "工具短板诊断" },
  { key: "card", label: "OPC定位卡", desc: "合成最终画像" },
];

const ADMIN_SESSION_KEY = "opc-admin-session";
const ADMIN_RECORDS_KEY = "opc-admin-records";
const ADMIN_ACCESS_KEY = "opc-admin-access-key";
const LEAD_INFO_KEY = "opc-lead-info";
const DEFAULT_ADMIN_PASSWORD = "opc2026";

const sampleAdminRecords = [
  {
    id: "OPC-20260709-001",
    name: "林然",
    phone: "138****2688",
    createdAt: "2026-07-09 10:24",
    level: "L7",
    levelName: "品类领导者",
    businessScore: 77,
    credit: 828,
    category: "女性服饰/穿搭",
    match: 81,
    aiWeakness: "自动化流程",
    status: "待跟进",
    owner: "未分配",
    source: "免费测评",
    note: "高意向，适合邀约品类诊断。",
  },
  {
    id: "OPC-20260709-002",
    name: "苏柚",
    phone: "156****9031",
    createdAt: "2026-07-09 11:08",
    level: "L6",
    levelName: "商业闭环者",
    businessScore: 72,
    credit: 808,
    category: "果酒/低度酒",
    match: 84,
    aiWeakness: "私域工具",
    status: "已联系",
    owner: "Mia",
    source: "定位卡样例",
    note: "对果酒内容号感兴趣，需要补私域承接。",
  },
  {
    id: "OPC-20260709-003",
    name: "许棠",
    phone: "177****6120",
    createdAt: "2026-07-09 12:36",
    level: "L5",
    levelName: "应用构建者",
    businessScore: 64,
    credit: 776,
    category: "香薰/家居香氛",
    match: 78,
    aiWeakness: "内容生产",
    status: "待分配",
    owner: "未分配",
    source: "AI工具测评",
    note: "审美强，内容连续性不足。",
  },
  {
    id: "OPC-20260708-014",
    name: "陈月",
    phone: "189****4077",
    createdAt: "2026-07-08 20:18",
    level: "L4",
    levelName: "项目执行者",
    businessScore: 58,
    credit: 752,
    category: "母婴用品",
    match: 76,
    aiWeakness: "提示词库",
    status: "已归档",
    owner: "Nora",
    source: "商业测评",
    note: "适合先做低门槛测品。",
  },
];

const adminStatuses = ["待跟进", "待分配", "已联系", "已转化", "已归档"];
const adminOwners = ["未分配", "Mia", "Nora", "Luna", "Yvonne"];

function readAdminRecords() {
  if (typeof window === "undefined") return sampleAdminRecords;
  try {
    const stored = window.localStorage.getItem(ADMIN_RECORDS_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : sampleAdminRecords;
  } catch {
    return sampleAdminRecords;
  }
}

function writeAdminRecords(records) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMIN_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Local storage can be blocked in private browsing; the dashboard still works in memory.
  }
}

function formatAdminTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildAdminRecord(recordId, business, ai, leadInfo = {}) {
  const primary = business.recommendedCategories[0];
  const name = leadInfo.name?.trim() || "当前访客";
  const phone = leadInfo.phone?.trim() || "未留资";
  return {
    id: recordId,
    name,
    phone,
    createdAt: formatAdminTime(),
    level: business.level.level,
    levelName: business.level.name,
    businessScore: business.totalScore,
    aiScore: ai.total,
    credit: creditScore(business),
    category: primary.name,
    match: primary.match,
    aiWeakness: ai.weakest,
    status: "待跟进",
    owner: "未分配",
    source: "完整OPC测评",
    note: `主推${primary.short}，优先补${ai.weakest}。`,
  };
}

function upsertAdminRecord(record) {
  const records = readAdminRecords();
  const next = [record, ...records.filter((item) => item.id !== record.id)];
  writeAdminRecords(next);
}

function readStoredLeadInfo() {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(LEAD_INFO_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function writeStoredLeadInfo(info) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LEAD_INFO_KEY, JSON.stringify(info));
  } catch {
    // Session storage is a convenience only; the form state still works.
  }
}

function sanitizeLeadInfo(info) {
  return {
    name: String(info?.name ?? "").trim().replace(/\s+/g, ""),
    phone: String(info?.phone ?? "").trim().replace(/[^\d+]/g, ""),
  };
}

function validateLeadInfo(info) {
  const clean = sanitizeLeadInfo(info);
  if (clean.name.length < 1 || clean.name.length > 24) return "请填写你的姓名。";
  if (!/^\+?\d{6,20}$/.test(clean.phone)) return "请填写有效手机号。";
  return "";
}

function hasLeadInfo(info) {
  return !validateLeadInfo(info);
}

function getAdminAccessKey() {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  try {
    return window.localStorage.getItem(ADMIN_ACCESS_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `请求失败：${response.status}`);
  }
  return payload;
}

async function saveAssessmentRecord({ record, business, ai, businessAnswers, aiAnswers }) {
  upsertAdminRecord(record);
  const payload = await requestJson("/api/records", {
    method: "POST",
    body: JSON.stringify({
      record,
      businessResult: business,
      aiResult: ai,
      businessAnswers,
      aiAnswers,
    }),
  });
  if (payload.record) upsertAdminRecord(payload.record);
  return payload.record;
}

async function fetchAdminRecords() {
  const payload = await requestJson("/api/records", {
    headers: { "x-admin-key": getAdminAccessKey() },
  });
  return Array.isArray(payload.records) ? payload.records : [];
}

async function loginAdmin(account, password) {
  return requestJson("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ account, password }),
  });
}

async function updateAdminRecord(id, patch) {
  const payload = await requestJson(`/api/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "x-admin-key": getAdminAccessKey() },
    body: JSON.stringify(patch),
  });
  return payload.record;
}

async function deleteAdminRecord(id) {
  return requestJson(`/api/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-admin-key": getAdminAccessKey() },
  });
}

function scoreFromOption(optionIndex) {
  return [4, 3, 2, 1][optionIndex] ?? 1;
}

function fallbackAnswers(questions) {
  return questions.map((_, index) => index % 4 === 0 ? 0 : index % 3 === 0 ? 2 : 1);
}

function clampScore(value, min = 35, max = 96) {
  return Math.min(max, Math.max(min, value));
}

function calculateBusiness(answers) {
  const raw = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));
  commercialQuestions.forEach((question, index) => {
    const answer = answers[index] ?? fallbackAnswers(commercialQuestions)[index];
    raw[question.dim] += scoreFromOption(answer);
  });

  const percentScores = {};
  let totalScore = 0;
  dimensions.forEach((dimension) => {
    const meta = dimensionMeta[dimension];
    const percent = Math.round((raw[dimension] / meta.full) * 100);
    percentScores[dimension] = percent;
    totalScore += percent * meta.weight;
  });

  const roundedScore = Math.round(totalScore);
  const level = levelMap.find((item) => roundedScore >= item.min && roundedScore <= item.max) ?? levelMap[0];
  const strongestDim = dimensions.reduce((top, dim) => percentScores[dim] > percentScores[top] ? dim : top, dimensions[0]);
  const weakestDim = dimensions.reduce((low, dim) => percentScores[dim] < percentScores[low] ? dim : low, dimensions[0]);
  const categoryMatches = categoryWeights
    .map((category) => {
      const weighted = dimensions.reduce((sum, dim, index) => sum + (percentScores[dim] / 100) * category.weights[index], 0);
      const total = category.weights.reduce((sum, value) => sum + value, 0);
      const baseMatch = (weighted / total) * 100;
      const averageRequirement = total / dimensions.length;
      const affinity = dimensions.reduce((sum, dim, index) => {
        const scoreDelta = percentScores[dim] - 70;
        const requirementDelta = category.weights[index] - averageRequirement;
        return sum + scoreDelta * requirementDelta;
      }, 0) / 28;
      const gapRisk = dimensions.reduce((sum, dim, index) => {
        const required = category.weights[index];
        const score = percentScores[dim];
        return required >= 75 && score < 68 ? sum + (68 - score) * 0.16 : sum;
      }, 0);
      return { ...category, match: clampScore(Math.round(baseMatch + affinity - gapRisk)) };
    })
    .sort((a, b) => b.match - a.match);
  const recommendedCategories = categoryMatches.slice(0, 3);

  return { raw, percentScores, totalScore: roundedScore, level, strongestDim, weakestDim, recommendedCategories, categoryMatches };
}

function calculateAi(answers) {
  const areas = ["提示词库", "内容生产", "自动化流程", "私域工具", "数据复盘", "工具成本"];
  const raw = Object.fromEntries(areas.map((area) => [area, 0]));
  const counts = Object.fromEntries(areas.map((area) => [area, 0]));
  aiQuestions.forEach((question, index) => {
    const answer = answers[index] ?? fallbackAnswers(aiQuestions)[index];
    raw[question.area] += scoreFromOption(answer);
    counts[question.area] += 1;
  });
  const percent = Object.fromEntries(areas.map((area) => [area, Math.round((raw[area] / (counts[area] * 4)) * 100)]));
  const weakest = areas.reduce((low, area) => percent[area] < percent[low] ? area : low, areas[0]);
  const strongest = areas.reduce((top, area) => percent[area] > percent[top] ? area : top, areas[0]);
  const total = Math.round(areas.reduce((sum, area) => sum + percent[area], 0) / areas.length);
  return { areas, percent, weakest, strongest, total };
}

const dimensionInsightCopy = {
  内容能力: {
    high: "适合用内容建立第一层信任，把选题、标题和真实体验做成稳定栏目。",
    mid: "已经有表达基础，下一步要沉淀固定栏目和素材库，减少临场发挥。",
    low: "先用模板化选题和AI辅助脚本降低启动难度，不急着追求风格完整。",
  },
  商业判断力: {
    high: "能判断谁会买、为什么买，适合先做品类选择和人群切分。",
    mid: "能看到机会，但需要用市场规模、增速和竞争格局来校准直觉。",
    low: "优先补一套品类分析框架，避免只凭喜好选项目。",
  },
  AI工具熟练度: {
    high: "AI已经能进入日常流程，可以把内容、客服和复盘拆成自动化任务。",
    mid: "会用AI提效，但还需要建立提示词库和固定工作流。",
    low: "先从高频任务切入，用少量工具跑通一条可复用流程。",
  },
  销售敏感度: {
    high: "具备把推荐转化为购买理由的能力，适合快速做首单验证。",
    mid: "能表达产品价值，后续要补充异议处理和成交话术。",
    low: "先把销售理解为解决问题，用案例和场景降低开口压力。",
  },
  学习能力: {
    high: "适合短周期试错，能边做边复盘，快速把经验转成SOP。",
    mid: "具备学习意愿，建议用7天小任务推进，而不是一次性学太多。",
    low: "先选低门槛项目，用陪跑式任务建立正反馈。",
  },
  社交影响力: {
    high: "已有信任触点，适合用社群、朋友圈和私域承接第一批用户。",
    mid: "有一定互动基础，下一步要固定输出频率和关系维护节奏。",
    low: "先从熟人反馈和小范围分享开始，不需要立刻追求大流量。",
  },
};

const aiActionCopy = {
  提示词库: "把选题、标题、产品卖点、私域话术整理成四套固定提示词。",
  内容生产: "先做7天内容流水线：选题、脚本、封面、发布节奏各一套模板。",
  自动化流程: "从咨询回复和资料整理开始，先串起一个低成本半自动流程。",
  私域工具: "建立客户标签、跟进节奏和成交记录，让每一次沟通可复盘。",
  数据复盘: "每周用数据表比较选题、互动和转化，把感觉变成判断依据。",
  工具成本: "先保留少数核心工具，按替代流程而不是新鲜感决定是否付费。",
};

function scoreTier(score) {
  if (score >= 82) return { label: "核心优势", tone: "strong" };
  if (score >= 68) return { label: "可放大", tone: "good" };
  if (score >= 52) return { label: "待系统化", tone: "build" };
  return { label: "优先补齐", tone: "weak" };
}

function dimensionInsight(dimension, score) {
  const band = score >= 75 ? "high" : score >= 55 ? "mid" : "low";
  return dimensionInsightCopy[dimension]?.[band] ?? "建议先完成最小可行行动，再根据反馈决定加码方向。";
}

function buildDimensionReport(business) {
  return dimensions
    .map((dimension) => {
      const score = business.percentScores[dimension] ?? 0;
      const meta = dimensionMeta[dimension];
      return {
        dimension,
        score,
        weight: Math.round(meta.weight * 100),
        tier: scoreTier(score),
        insight: dimensionInsight(dimension, score),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildCategoryRationales(business, ai) {
  return business.recommendedCategories.map((category, index) => {
    const drivers = dimensions
      .map((dimension, dimIndex) => ({
        dimension,
        contribution: Math.round((business.percentScores[dimension] / 100) * category.weights[dimIndex]),
      }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 2);
    return {
      ...category,
      rank: index + 1,
      drivers,
      reason: `${drivers.map((item) => item.dimension).join(" + ")}贡献最高，与你当前的${business.strongestDim}优势相连；先补${ai.weakest}，更容易把种草、承接和成交串成闭环。`,
    };
  });
}

function buildBespokeRoute(business, ai) {
  const primary = business.recommendedCategories[0];
  return [
    {
      period: "第1周",
      title: "定位校准",
      text: `以${primary.name}作为主攻方向，拆出1类核心人群、3个高频场景和1个可验证卖点。`,
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
      text: `${aiActionCopy[ai.weakest]}重点让${ai.weakest}不再靠临时发挥。`,
      output: "提示词库 + SOP",
    },
    {
      period: "第4周",
      title: "首单验证",
      text: `围绕${primary.gate}门槛做一次小单测试，用咨询量、转化率和复购意愿决定是否加码。`,
      output: "首单复盘 + 升级路径",
    },
  ];
}

function AppHeader({ view, onNavigate, adminLoggedIn }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = [
    ["home", "首页"],
    ["business", "商业测评"],
    ["ai", "AI工具测评"],
    ["card", "OPC定位卡"],
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [view]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  function navigateTo(nextView) {
    setMobileMenuOpen(false);
    onNavigate(nextView);
  }

  return (
    <header className={`site-header site-header-${view} ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <button className="brand" type="button" onClick={() => navigateTo("home")} aria-label="返回首页">
        <span className="brand-wordmark">
          <strong className="brand-script">她智汇</strong>
          <small>Human Leverage Atelier</small>
        </span>
      </button>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={mobileMenuOpen ? "关闭导航" : "打开导航"}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        {mobileMenuOpen ? <X size={24} weight="light" /> : <List size={26} weight="light" />}
      </button>
      <nav className="desktop-nav" aria-label="主导航">
        {nav.map(([key, label]) => (
          <button
            className={view === key ? "active" : ""}
            key={key}
            type="button"
            aria-current={view === key ? "page" : undefined}
            onClick={() => navigateTo(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {mobileMenuOpen && (
        <div className="mobile-menu-panel" id="mobile-navigation">
          <nav aria-label="移动导航">
            {nav.map(([key, label]) => (
              <button
                className={view === key ? "active" : ""}
                key={key}
                type="button"
                aria-current={view === key ? "page" : undefined}
                onClick={() => navigateTo(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <button className="mobile-admin-link" type="button" onClick={() => navigateTo(adminLoggedIn ? "admin" : "admin-login")}>
            {adminLoggedIn ? "进入管理后台" : "管理员登录"}
          </button>
        </div>
      )}
      <button
        className="auth-pill"
        type="button"
        aria-current={view === "admin" || view === "admin-login" ? "page" : undefined}
        onClick={() => navigateTo(adminLoggedIn ? "admin" : "admin-login")}
      >
        {adminLoggedIn ? "管理后台" : "管理员登录"}
      </button>
    </header>
  );
}

function FlowStepper({ current, completed = [] }) {
  return (
    <section className="flow-stepper" aria-label="三步测评流程">
      {stepLabels.map((step, index) => {
        const active = step.key === current;
        const done = completed.includes(step.key);
        return (
          <div
            className={`flow-step ${active ? "active" : ""} ${done ? "done" : ""}`}
            key={step.key}
            aria-current={active ? "step" : undefined}
          >
            <span className="step-dot">{done ? <Check size={15} weight="bold" /> : index + 1}</span>
            <span>
              <strong>{step.label}</strong>
              <small>{step.desc}</small>
            </span>
          </div>
        );
      })}
    </section>
  );
}

function HomePage({ setView, onStart, businessResult }) {
  const heroRef = useRef(null);
  const preview = businessResult ?? calculateBusiness(fallbackAnswers(commercialQuestions));

  useEffect(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        isMobile: "(max-width: 760px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isMobile, reduceMotion } = context.conditions;
        const hero = heroRef.current;
        if (!isMobile || !hero) return undefined;

        const photo = hero.querySelector(".mobile-velvet-photo");
        const eyebrow = hero.querySelector(".eyebrow");
        const title = hero.querySelector("h1");
        const body = hero.querySelector(".mobile-hero-copy");
        const actions = hero.querySelector(".hero-actions");
        const brand = document.querySelector(".site-header-home .brand");
        const menu = document.querySelector(".site-header-home .mobile-menu-toggle");
        const targets = [photo, eyebrow, title, body, actions, brand, menu].filter(Boolean);

        if (reduceMotion) {
          gsap.set(targets, { clearProps: "all" });
          return undefined;
        }

        const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
        timeline
          .from(photo, { opacity: 0, scale: 1.045, duration: 1.2, ease: "sine.out" }, 0.16)
          .from(brand, { opacity: 0, x: -16, duration: 0.52, ease: "expo.out" }, 0.34)
          .from(menu, { opacity: 0, scale: 0.86, duration: 0.38, ease: "back.out(1.15)" }, 0.46)
          .from(eyebrow, { opacity: 0, x: -18, duration: 0.46, ease: "circ.out" }, 0.68)
          .from(title, { opacity: 0, y: 28, scale: 0.985, duration: 0.76, ease: "power4.out" }, 0.76)
          .from(body, { opacity: 0, x: -14, duration: 0.56, ease: "power2.out" }, 0.94)
          .from(actions, { opacity: 0, y: 22, duration: 0.66, ease: "back.out(1.08)" }, 1.1)
          .to(photo, { yPercent: -0.6, scale: 1.01, duration: 2.1, ease: "sine.inOut" }, 1.34);

        return () => timeline.kill();
      },
    );

    return () => media.revert();
  }, []);

  return (
    <main
      className="page-shell home-shell editorial-home"
      style={{
        "--home-wave-bg": `url(${fruitWineWave})`,
        "--mobile-velvet-bg": `url(${oxbloodVelvet})`,
        "--mobile-paper-bg": `url(${dustyBlushPaper})`,
        "--mobile-transition-bg": `url(${atelierPaperTransition})`,
      }}
    >
      <section className="editorial-hero" ref={heroRef}>
        <div className="mobile-velvet-photo" aria-hidden="true" />
        <div className="hero-flow-wash" aria-hidden="true" />
        <div className="editorial-copy">
          <span className="eyebrow">PRIVATE OPC INTAKE · 3分钟</span>
          <h1>
            <span className="desktop-hero-title">
              <span>为你的商业感</span>
              <span className="hero-title-accent">定一张定位卡</span>
            </span>
            <span className="mobile-hero-title">
              <span>为你的商业感，</span>
              <span className="hero-title-accent">定一张定位卡</span>
            </span>
          </h1>
          <p>
            <span className="desktop-hero-copy">
              像进入一间私人商业定位室，从商业能力、AI工具短板到18个女性赛道建议，生成一张清晰、可启动的个人OPC定位卡。
            </span>
            <span className="mobile-hero-copy">
              看清女性赛道、AI工具短板与下一步启动路径。
            </span>
          </p>
          <div className="hero-meta-line" aria-label="测评包含内容">
            <span>18个女性赛道</span>
            <span>AI工具短板</span>
            <span>L1-L9 OPC等级</span>
          </div>
          <MobileOutcomeCard preview={preview} />
          <div className="hero-actions">
            <button className="primary-btn" type="button" onClick={onStart}>
              开始私人测评 <ArrowRight size={18} />
            </button>
            <button className="ghost-btn" type="button" onClick={() => setView("card")}>
              查看定位卡样例
            </button>
          </div>
        </div>

        <DossierPreview preview={preview} />
      </section>

      <MobileAtelierHome
        preview={preview}
        onStart={onStart}
        onOpenCard={() => setView("card")}
      />

      <section className="chapter-strip" aria-label="三步测评路径">
        <div className="chapter-title">
          <span />
          <strong>三步，找到你的商业放大路径</strong>
          <span />
        </div>
        <div className="chapter-list">
          <EditorialStep
            icon={Compass}
            no="01"
            title="OPC商业潜力测评"
            desc="17题 · 六维能力 · 从18个女性赛道中推荐Top3品类"
          />
          <EditorialStep
            icon={MagicWand}
            no="02"
            title="AI工具能力测评"
            desc="识别提示词、内容生产、自动化、私域工具短板"
          />
          <EditorialStep
            icon={Target}
            no="03"
            title="个人OPC定位卡"
            desc="生成等级、品类、卡点、价值、下一步路径"
          />
        </div>
      </section>

      <section className="taxonomy-section">
        <div className="taxonomy-intro">
          <span className="eyebrow">18个女性赛道候选池</span>
          <h2>女性商业<br />赛道图谱</h2>
          <p>从品类出发，找到最适合你的商业机会</p>
          <button className="primary-btn compact" type="button" onClick={onStart}>
            查看你的赛道建议 <ArrowRight size={16} />
          </button>
        </div>
        <CategoryGrid />
      </section>
    </main>
  );
}

function LeadCapture({ initialLead, onSubmit, onBack }) {
  const [form, setForm] = useState(() => sanitizeLeadInfo(initialLead || {}));
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const clean = sanitizeLeadInfo(form);
    const message = validateLeadInfo(clean);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSubmit(clean);
  }

  return (
    <main className="page-shell lead-shell" style={{ "--lead-wave-bg": `url(${fruitWineWave})` }}>
      <section className="lead-intake-card" aria-labelledby="lead-intake-title">
        <div className="lead-intake-copy">
          <span className="eyebrow">PRIVATE OPC INTAKE</span>
          <h1 id="lead-intake-title">先建立你的私人测评档案</h1>
          <p>
            填写姓名和手机号后开始测评。完成后，商业能力、AI工具短板、OPC等级和18个女性赛道推荐会归入你的私人定位档案。
          </p>
          <div className="lead-assurance" aria-label="测评数据说明">
            <span>3分钟完成</span>
            <span>生成定位卡</span>
            <span>仅用于OPC诊断跟进</span>
          </div>
        </div>

        <form className="lead-form-panel" onSubmit={handleSubmit}>
          <label>
            <span>姓名</span>
            <input
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="请输入姓名"
            />
          </label>
          <label>
            <span>手机号</span>
            <input
              autoComplete="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="请输入手机号"
            />
          </label>
          {error && <p className="lead-error" role="alert">{error}</p>}
          <button className="primary-btn" type="submit">
            开始测评 <ArrowRight size={18} />
          </button>
          <button className="ghost-btn" type="button" onClick={onBack}>
            返回首页
          </button>
          <p className="lead-privacy-note">
            你的资料仅用于查看报告和跟进服务，不会展示在公开页面。
          </p>
        </form>
      </section>
    </main>
  );
}

function MobileOutcomeCard({ preview }) {
  const top = preview.recommendedCategories.slice(0, 3);
  return (
    <article className="mobile-outcome-card" aria-label="移动端OPC定位卡预览">
      <div className="mobile-outcome-head">
        <span>定位卡预览</span>
        <strong>{preview.level.level}</strong>
      </div>
      <div className="mobile-outcome-main">
        <div>
          <small>她信分</small>
          <strong>{creditScore(preview)}</strong>
        </div>
        <div>
          <small>主赛道</small>
          <strong>{top[0].short}</strong>
        </div>
      </div>
      <div className="mobile-outcome-tags">
        {top.map((category, index) => (
          <span key={category.name}>
            {String(index + 1).padStart(2, "0")} {category.short}
          </span>
        ))}
      </div>
      <div className="mobile-outcome-foot">
        <span>AI工具短板</span>
        <strong>内容生产 · 自动化流程</strong>
      </div>
    </article>
  );
}

function DossierPreview({ preview }) {
  const top = preview.recommendedCategories.slice(0, 3);

  return (
    <figure className="editorial-visual luxury-dossier" aria-label="个人OPC定位卡高端预览">
      <img className="atelier-hero-photo atelier-wave-photo" src={fruitWineWave} alt="" aria-hidden="true" />
      <div className="premium-stage">
        <div className="stage-rail">
          <span>PRIVATE</span>
          <strong>OPC INTAKE</strong>
        </div>

        <article className="premium-dossier-card">
          <div className="premium-card-top">
            <span className="mini-wordmark brand-script">她智汇</span>
            <div>
              <strong>Human Leverage Atelier</strong>
              <small>PRIVATE COMMERCIAL DOSSIER</small>
            </div>
            <em>{preview.level.level}</em>
          </div>

          <div className="premium-card-title">
            <span>PERSONAL OPC POSITIONING CARD</span>
            <h2>个人OPC定位卡</h2>
          </div>

          <div className="premium-score-board">
            <div>
              <span>她信分</span>
              <strong>{creditScore(preview)}</strong>
              <small>商业潜力综合分</small>
            </div>
            <div>
              <span>OPC等级</span>
              <strong>{preview.level.level}</strong>
              <small>{preview.level.name}</small>
            </div>
          </div>

          <div className="premium-category-list">
            <span>推荐品类 Top3</span>
            {top.map((category, index) => (
              <div className="premium-category-row" key={category.name}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <strong>{category.name}</strong>
                <i><b style={{ width: `${category.match}%` }} /></i>
                <small>{category.match}%</small>
              </div>
            ))}
          </div>

          <div className="premium-card-foot">
            <div>
              <span>优势维度</span>
              <strong>{preview.strongestDim}</strong>
            </div>
            <div>
              <span>下一步</span>
              <strong>用AI工具把内容、私域和交付做成流程</strong>
            </div>
          </div>
        </article>

        <aside className="premium-side-panel">
          <span>TOP SIGNAL</span>
          <strong>{top[0].short}</strong>
          <small>{top[0].market}市场 · {top[0].growth}增长 · {top[0].gate}</small>
        </aside>

        <div className="loading-storyboard" aria-hidden="true">
          <span>01</span>
          <span>02</span>
          <span>03</span>
        </div>
      </div>
      <figcaption className="sr-only">
        定位卡样例：{preview.level.level}，{preview.level.name}，推荐品类为{top.map((category) => category.short).join("、")}。
      </figcaption>
    </figure>
  );
}

function MobileAtelierHome({ preview, onStart, onOpenCard }) {
  const top = preview.recommendedCategories.slice(0, 3);

  return (
    <div className="mobile-atelier-home">
      <div className="mobile-paper-transition" aria-hidden="true">
        <img className="atelier-transition-reference" src={tzhTransitionReference} alt="" />
      </div>

      <section className="mobile-dossier-showcase" aria-labelledby="mobile-dossier-title">
        <div className="mobile-dossier-layout">
          <article className="mobile-physical-card">
            <div className="mobile-card-brand">
              <span className="brand-script">她智汇</span>
              <small>Human Leverage Atelier</small>
            </div>
            <span className="mobile-card-ribbon">{preview.level.level}</span>
            <p>PERSONAL OPC POSITIONING CARD</p>
            <h2 id="mobile-dossier-title">个人OPC定位卡</h2>
            <div className="mobile-card-score">
              <div>
                <small>她信分</small>
                <strong>{creditScore(preview)}</strong>
              </div>
              <div>
                <small>OPC等级</small>
                <strong>{preview.level.level}</strong>
                <span>{preview.level.name}</span>
              </div>
            </div>
            <div className="mobile-card-top3">
              <span>推荐赛道 TOP3</span>
              {top.map((category, index) => (
                <div key={category.name}>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  <strong>{category.short}</strong>
                  <i aria-hidden="true"><b style={{ width: `${category.match}%` }} /></i>
                  <small>{category.match}%</small>
                </div>
              ))}
            </div>
            <div className="mobile-card-footnote">
              <span>优势维度<strong>{preview.strongestDim}</strong></span>
              <span>下一步<strong>补齐AI流程</strong></span>
            </div>
          </article>

          <div className="mobile-track-ledger">
            <span>18 WOMEN'S TRACKS</span>
            <h2>18个女性赛道<br />全景领域一览</h2>
            <ol>
              {categoryWeights.map((category, index) => (
                <li key={category.name}>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  <span>{category.short}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <button className="atelier-text-link" type="button" onClick={onOpenCard}>
          查看定位卡样例 <ArrowRight size={15} />
        </button>
      </section>

      <section className="mobile-process-ledger" aria-labelledby="mobile-process-title">
        <span className="mobile-section-kicker">PROCESS · 01/03</span>
        <h2 id="mobile-process-title">从0到你的商业定位</h2>
        <div className="mobile-process-rows">
          <button type="button" onClick={onStart}>
            <em>01</em>
            <span><strong>商业能力测评</strong><small>看见你的优势、资源与商业方式</small></span>
            <b>约3分钟</b>
          </button>
          <button type="button" onClick={onStart}>
            <em>02</em>
            <span><strong>AI工具测评</strong><small>找到内容、私域与交付的效率短板</small></span>
            <b>约3分钟</b>
          </button>
          <button type="button" onClick={onOpenCard}>
            <em>03</em>
            <span><strong>OPC定位卡</strong><small>结合18个女性赛道生成启动建议</small></span>
            <b>即时生成</b>
          </button>
        </div>
      </section>

      <section className="mobile-closing-band">
        <span>PRIVATE COMMERCIAL DOSSIER</span>
        <h2>你的第一张<br />商业定位档案</h2>
        <p>输入姓名与手机号，开始免费测评。</p>
        <button type="button" onClick={onStart}>
          开始3分钟测评 <ArrowRight size={18} />
        </button>
        <small>仅用于生成与保存你的测评记录</small>
        <strong className="atelier-signature">她智汇</strong>
      </section>

      <footer className="mobile-atelier-footer">
        <span className="footer-brand-lockup"><b className="brand-script">她智汇</b> Human Leverage Atelier</span>
        <span>隐私说明 · 管理员登录</span>
      </footer>
    </div>
  );
}

function EditorialStep({ icon: Icon, title, desc, no }) {
  return (
    <article className="editorial-step">
      <span className="editorial-step-icon"><Icon size={18} /></span>
      <strong>{no}</strong>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </article>
  );
}

function ProcessCard({ icon: Icon, title, desc, no, mini }) {
  return (
    <article className="process-card">
      <strong className="process-no">{no}</strong>
      <span className="icon-pill"><Icon size={20} /></span>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <div className="process-mini">{mini}</div>
    </article>
  );
}

function CategoryChips() {
  return (
    <div className="chips" aria-label="18个女性赛道">
      {categoryWeights.map((category) => <span key={category.name}>{category.short}</span>)}
    </div>
  );
}

function CategoryGrid() {
  return (
    <div className="category-grid" aria-label="18个女性赛道">
      {categoryWeights.map((category, index) => (
        <button type="button" key={category.name}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{category.short}</strong>
        </button>
      ))}
    </div>
  );
}

function BusinessAssessment({ answers, setAnswers, setView, businessResult }) {
  const [index, setIndex] = useState(0);
  const question = commercialQuestions[index];
  const selected = answers[index];
  const progress = Math.round(((index + 1) / commercialQuestions.length) * 100);
  const questionId = `business-question-${index + 1}`;
  const interim = calculateBusiness(answers);

  function selectOption(optionIndex) {
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
  }

  function nextQuestion() {
    if (index < commercialQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      setView("ai");
    }
  }

  return (
    <main className="page-shell assessment-shell">
      <FlowStepper current="business" completed={businessResult ? ["business"] : []} />
      <section className="assessment-layout">
        <aside className="side-summary">
          <span className="eyebrow">Step 1</span>
          <h1>OPC商业潜力测评</h1>
          <p>17题，测出你的六维商业能力，并从18个女性赛道里推荐Top3品类。</p>
          <div className="mini-score-list">
            {dimensions.map((dim) => (
              <div key={dim}>
                <span>{dim}</span>
                <strong>{interim.percentScores[dim] || 0}</strong>
              </div>
            ))}
          </div>
        </aside>

        <section className="question-panel">
          <div className="question-head">
            <div>
              <span className="large-count">{index + 1}</span>
              <span className="total-count">/ {commercialQuestions.length}</span>
            </div>
            <span className="dimension-tag">{question.dim}</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="商业潜力测评进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <h2 id={questionId}>{question.q}</h2>
          <div className="option-list" role="radiogroup" aria-labelledby={questionId}>
            {question.options.map((option, optionIndex) => (
              <button
                className={selected === optionIndex ? "selected" : ""}
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === optionIndex}
                onClick={() => selectOption(optionIndex)}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </button>
            ))}
          </div>
          <div className="question-actions">
            <button className="ghost-btn" type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              上一题
            </button>
            <button className="primary-btn compact" type="button" onClick={nextQuestion}>
              {index === commercialQuestions.length - 1 ? "进入AI工具测评" : "下一题"} <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <aside className="category-pool">
          <span className="eyebrow">18个女性赛道候选池</span>
          <h2>提交后生成Top3推荐品类</h2>
          <CategoryChips />
          <div className="top-preview">
            {interim.recommendedCategories.map((category, idx) => (
              <div key={category.name}>
                <span>0{idx + 1}</span>
                <strong>{category.name}</strong>
                <small>{category.match}% · {category.income}</small>
              </div>
            ))}
          </div>
        </aside>
      </section>
      <DimensionBand scores={interim.percentScores} />
    </main>
  );
}

function AiAssessment({ aiAnswers, setAiAnswers, setView, businessResult, aiResult }) {
  const [index, setIndex] = useState(0);
  const question = aiQuestions[index];
  const selected = aiAnswers[index];
  const business = businessResult ?? calculateBusiness(fallbackAnswers(commercialQuestions));
  const interim = calculateAi(aiAnswers);
  const progress = Math.round(((index + 1) / aiQuestions.length) * 100);
  const questionId = `ai-question-${index + 1}`;

  function selectOption(optionIndex) {
    const next = [...aiAnswers];
    next[index] = optionIndex;
    setAiAnswers(next);
  }

  function nextQuestion() {
    if (index < aiQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      setView("card");
    }
  }

  return (
    <main className="page-shell assessment-shell">
      <FlowStepper current="ai" completed={["business"].concat(aiResult ? ["ai"] : [])} />
      <section className="assessment-layout ai-layout">
        <aside className="side-summary completed">
          <span className="eyebrow">商业测评已完成</span>
          <h1>{business.level.level} · {business.level.name}</h1>
          <p>当前Top3品类：{business.recommendedCategories.map((item) => item.short).join(" / ")}</p>
          <RadarChart scores={business.percentScores} compact />
        </aside>

        <section className="question-panel">
          <div className="question-head">
            <div>
              <span className="large-count">{index + 1}</span>
              <span className="total-count">/ {aiQuestions.length}</span>
            </div>
            <span className="dimension-tag">{question.area}</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="AI工具能力测评进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <h2 id={questionId}>{question.q}</h2>
          <div className="option-list" role="radiogroup" aria-labelledby={questionId}>
            {question.options.map((option, optionIndex) => (
              <button
                className={selected === optionIndex ? "selected" : ""}
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === optionIndex}
                onClick={() => selectOption(optionIndex)}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </button>
            ))}
          </div>
          <div className="question-actions">
            <button className="ghost-btn" type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              上一题
            </button>
            <button className="primary-btn compact" type="button" onClick={nextQuestion}>
              {index === aiQuestions.length - 1 ? "生成OPC定位卡" : "下一题"} <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <aside className="category-pool ai-map">
          <span className="eyebrow">AI能力地图</span>
          <h2>测完后写入定位卡</h2>
          <div className="tool-map">
            {interim.areas.slice(0, 4).map((area) => (
              <div key={area}>
                <span>{area}</span>
                <strong>{interim.percent[area] || 0}</strong>
              </div>
            ))}
          </div>
          <div className="tool-stack">
            {["ChatGPT/Claude", "Canva/稿定设计", "剪映", "微伴助手", "Coze/Dify"].map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </aside>
      </section>
      <section className="dimension-band tool-band">
        <div className="band-title"><span />AI工具能力地图<span /></div>
        <div className="dimension-cards">
          {interim.areas.map((area) => (
            <article key={area}>
              <MagicWand size={30} weight="duotone" />
              <strong>{area}</strong>
              <span>{interim.percent[area] || 0}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function DimensionBand({ scores }) {
  return (
    <section className="dimension-band">
      <div className="band-title"><span />六维能力维度<span /></div>
      <div className="dimension-cards">
        {dimensions.map((dimension) => (
          <article key={dimension}>
            <Compass size={30} weight="duotone" />
            <strong>{dimension}</strong>
            <span>{scores[dimension] ?? "--"}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobilePositioningReport({
  profileName,
  business,
  ai,
  top,
  dimensionReport,
  bespokeRoute,
  copied,
  onCopy,
  onDownload,
  onRestart,
  onAiAssessment,
}) {
  const weakestAreas = [...ai.areas]
    .sort((left, right) => ai.percent[left] - ai.percent[right])
    .slice(0, 3);

  return (
    <section className="mobile-positioning-report" aria-label="个人OPC定位卡详情">
      <section className="mobile-result-hero">
        <span>PRIVATE OPC DOSSIER · RESULT 01/03</span>
        <h1>{profileName}</h1>
        <p>你的个人OPC定位卡</p>
        <small>{new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())}</small>
      </section>

      <div className="mobile-result-transition" aria-hidden="true">
        <span className="atelier-signature">她智汇</span>
        <span className="atelier-byline">PRIVATE COMMERCIAL DOSSIER</span>
      </div>

      <section className="mobile-result-dossier">
        <div className="mobile-result-scoreboard">
          <div>
            <span>她信分</span>
            <strong>{creditScore(business)}</strong>
            <small>商业潜力综合分</small>
          </div>
          <div>
            <span>OPC等级</span>
            <strong>{business.level.level}</strong>
            <small>{business.level.name}</small>
          </div>
        </div>

        <div className="mobile-report-top3">
          <div className="mobile-report-section-head">
            <span>01</span>
            <h2>推荐赛道 TOP3</h2>
          </div>
          {top.map((category, index) => (
            <div className="mobile-report-match" key={category.name}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <strong>{category.name}</strong>
              <i aria-hidden="true"><b style={{ width: `${category.match}%` }} /></i>
              <span>{category.match}%</span>
            </div>
          ))}
          <p>你更适合以{business.strongestDim}与长期信任，建立高溢价的小而美品牌。</p>
        </div>

        <div className="mobile-positioning-why">
          <div><span>优势维度</span><strong>{business.strongestDim}</strong></div>
          <div><span>商业方式</span><strong>信任驱动</strong></div>
          <div><span>增长抓手</span><strong>社群口碑</strong></div>
        </div>
      </section>

      <section className="mobile-report-band mobile-dimension-ledger">
        <div className="mobile-report-section-head">
          <span>02</span>
          <h2>商业能力六维图谱</h2>
        </div>
        {dimensionReport.map((item) => (
          <div className="mobile-dimension-row" key={item.dimension}>
            <strong>{item.dimension}</strong>
            <i aria-hidden="true"><b style={{ width: `${item.score}%` }} /></i>
            <span>{item.score}</span>
          </div>
        ))}
        <p>你的优势集中在{business.strongestDim}；{business.weakestDim}是下一阶段重点。</p>
      </section>

      <section className="mobile-report-band mobile-ai-ledger">
        <div className="mobile-report-section-head">
          <span>03</span>
          <h2>AI工具短板</h2>
        </div>
        {weakestAreas.map((area, index) => (
          <div className="mobile-ai-row" key={area}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <strong>{area}</strong>
            <span>{ai.percent[area]}</span>
            <small>{index === 0 ? "优先补齐" : index === 1 ? "建立标准动作" : "可快速提升"}</small>
          </div>
        ))}
      </section>

      <section className="mobile-report-band mobile-route-ledger">
        <div className="mobile-report-section-head">
          <span>04</span>
          <h2>你的30天启动路径</h2>
        </div>
        {bespokeRoute.map((item, index) => (
          <article key={item.title}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <div><span>{item.period}</span><strong>{item.title}</strong><p>{item.text}</p></div>
          </article>
        ))}
      </section>

      <section className="mobile-report-actions">
        <span>TURN POSITIONING INTO ACTION</span>
        <h2>把定位变成第一步</h2>
        <button type="button" onClick={onAiAssessment}>
          继续AI工具测评 <ArrowRight size={18} />
        </button>
        <button className="mobile-report-link" type="button" onClick={onDownload}>
          生成分享图
        </button>
        <button className="mobile-report-link" type="button" onClick={onCopy}>
          {copied ? "分享文案已复制" : "复制分享文案"}
        </button>
        <button className="mobile-report-link" type="button" onClick={onRestart}>
          重新测评
        </button>
        <strong className="atelier-signature">她智汇</strong>
      </section>
    </section>
  );
}

function PositioningCard({ businessResult, aiResult, setView, sessionRecordId, leadInfo, businessAnswers, aiAnswers }) {
  const business = businessResult ?? calculateBusiness(fallbackAnswers(commercialQuestions));
  const ai = aiResult ?? calculateAi(fallbackAnswers(aiQuestions));
  const [copied, setCopied] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const savedRecordKey = useRef("");
  const top = business.recommendedCategories;
  const primaryCategory = top[0];
  const isDemoReport = !businessResult || !aiResult;
  const profileName = isDemoReport ? "林然" : leadInfo?.name || "当前访客";
  const profileInitial = profileName.slice(0, 1) || "她";
  const dimensionReport = buildDimensionReport(business);
  const categoryRationales = buildCategoryRationales(business, ai);
  const bespokeRoute = buildBespokeRoute(business, ai);
  const shareText = `我刚测了OPC商业定位，结果是${business.level.level}${business.level.name}。最推荐我从${top[0].name}切入，AI工具短板是${ai.weakest}。`;

  useEffect(() => {
    if (isDemoReport || !hasLeadInfo(leadInfo)) return;
    const record = buildAdminRecord(sessionRecordId, business, ai, leadInfo);
    const currentKey = `${record.id}:${record.businessScore}:${record.aiScore}:${record.phone}`;
    if (savedRecordKey.current === currentKey) return;
    savedRecordKey.current = currentKey;
    saveAssessmentRecord({
      record,
      business,
      ai,
      businessAnswers,
      aiAnswers,
    }).catch(() => {
      savedRecordKey.current = "";
    });
  }, [ai, aiAnswers, business, businessAnswers, isDemoReport, leadInfo, sessionRecordId]);

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(`${shareText} 测一测你的OPC定位。`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadShareImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 506;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FAF6F3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#7A3B52";
    ctx.font = "700 34px 'Microsoft YaHei', sans-serif";
    ctx.fillText("个人OPC定位卡", 56, 76);
    ctx.font = "700 58px 'Microsoft YaHei', sans-serif";
    ctx.fillText(profileInitial, 74, 175);
    ctx.font = "700 32px 'Microsoft YaHei', sans-serif";
    ctx.fillText(`${profileName} · ${business.level.level} ${business.level.name}`, 150, 148);
    ctx.font = "500 24px 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#4A2C3A";
    ctx.fillText(`她信分 ${creditScore(business)} · 商业测评 ${business.totalScore}分`, 150, 190);
    ctx.fillText(`推荐品类：${top.map((item) => `${item.short} ${item.match}%`).join(" / ")}`, 56, 270);
    ctx.fillText(`AI工具短板：${ai.weakest}`, 56, 320);
    ctx.fillText("下一步：申请OPC孵化营，4周从品类分析到首单交付", 56, 370);
    ctx.fillStyle = "#C9A96E";
    ctx.fillRect(56, 424, 788, 2);
    ctx.font = "italic 500 28px 'STXingkai', 'KaiTi', cursive";
    ctx.fillText("她智汇", 56, 470);
    const link = document.createElement("a");
    link.download = "我的OPC定位卡.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main
      className="page-shell card-shell"
      style={{
        "--mobile-velvet-bg": `url(${oxbloodVelvet})`,
        "--mobile-paper-bg": `url(${dustyBlushPaper})`,
        "--mobile-transition-bg": `url(${atelierPaperTransition})`,
      }}
    >
      <FlowStepper current="card" completed={["business", "ai"]} />
      <MobilePositioningReport
        profileName={profileName}
        business={business}
        ai={ai}
        top={top}
        dimensionReport={dimensionReport}
        bespokeRoute={bespokeRoute}
        copied={copied}
        onCopy={copyShareText}
        onDownload={downloadShareImage}
        onRestart={() => setView("business")}
        onAiAssessment={() => setView("ai")}
      />
      <section className="card-title-row">
        <div>
          <span className="document-kicker">PERSONAL OPC POSITIONING CARD</span>
          <h1>个人OPC定位卡</h1>
          <p>{isDemoReport ? "当前为样例报告；完成两项测评后，会替换为你的专属计算结果。" : "基于你的题目答案，商业等级、推荐品类、AI工具短板和下一步路径已经生成。"}</p>
        </div>
        <button className="ghost-btn" type="button" onClick={() => setView("business")}>重新测评</button>
      </section>

      <section className="final-dashboard">
        <section className="opc-master-card">
          <div className="profile-column">
            <div className="profile-row xl">
              <span className="avatar">{profileInitial}</span>
              <div>
                <h2>{profileName}</h2>
                <p>{business.level.level} · {business.level.name}</p>
              </div>
            </div>
            <blockquote>你已经具备发现机会和动手搭建的能力，下一步是把内容、销售、交付变成可复用流程。</blockquote>
            <div className="metric-grid slim">
              <Metric label="她信分" value={creditScore(business)} />
              <Metric label="商业测评" value={`${business.totalScore}分`} />
            </div>
            <div className="level-line">
              <span>L1</span>
              <i />
              <strong>{business.level.level}</strong>
              <i />
              <span>L9</span>
            </div>
            <div className="profile-facts">
              <div><span>OPC等级</span><strong>{business.level.level} · {business.level.name}</strong></div>
              <div><span>品类专精</span><strong>{top[0].short} L7 · 深度</strong></div>
              <div><span>月GMV潜力</span><strong>¥8,000+</strong></div>
            </div>
          </div>

          <div className="radar-column">
            <h2>六维能力维度</h2>
            <RadarChart scores={business.percentScores} />
            <p className="sr-only">
              六维能力分数：
              {dimensions.map((dimension) => `${dimension}${business.percentScores[dimension]}分`).join("，")}。
            </p>
            <button className="ghost-btn compact-ghost" type="button" onClick={() => setInsightOpen(!insightOpen)}>
              查看能力详情 <ArrowRight size={16} />
            </button>
          </div>

          <div className="top3-column">
            <h2>推荐品类 Top3</h2>
            {top.map((category, index) => (
              <div className="category-match detailed" key={category.name}>
                <span>{String(index + 1).padStart(2, "0")} {category.name}</span>
                <div className="match-bar"><i style={{ width: `${category.match}%` }} /></div>
                <strong>{category.match}%</strong>
              </div>
            ))}
            <div className="mini-insights">
              <InsightCard title="卡在哪里" text={`内容能做出来，但${ai.weakest}还没有形成可复用流程。`} />
              <InsightCard title="价值所在" text={`${business.strongestDim}突出，适合先从${top[0].name}跑通首单。`} />
            </div>
          </div>

          <div className="ai-tool-row">
            <div>
              <span>AI工具短板</span>
              <strong>{ai.weakest}</strong>
              <small>自动化流程待建立</small>
            </div>
            <div>
              <span>AI工具推荐</span>
              <strong>ChatGPT · Canva · 剪映 · 微伴助手</strong>
              <small>优先使用</small>
            </div>
          </div>
        </section>

        <aside className="action-column">
          <article className="path-card">
            <h2>下一步行动路径</h2>
            <div className="path-icons">
              {["申请OPC孵化营", "4周品类分析", "首单交付", "升级L6"].map((item) => <span key={item}>{item}</span>)}
            </div>
            <p>建议在30天内完成首单验证，进入价值验证者阶段（L6）。</p>
          </article>
          <button className="action-tile" type="button" onClick={downloadShareImage}>
            <DownloadSimple size={34} weight="duotone" />
            <strong>生成分享图</strong>
            <span>一键生成精美海报</span>
          </button>
          <button className="action-tile" type="button" onClick={copyShareText}>
            <Copy size={34} weight="duotone" />
            <strong>{copied ? "分享文案已复制" : "复制分享文案"}</strong>
            <span>专属分享文案</span>
          </button>
          <button className="action-tile" type="button">
            <Target size={34} weight="duotone" />
            <strong>领取品类快照</strong>
            <span>18品类趋势卡片</span>
          </button>
        </aside>
      </section>

      <section className="bespoke-route-section" aria-label="高端定制路线">
        <div className="bespoke-intro">
          <span className="document-kicker">BESPOKE OPC ROADMAP</span>
          <h2>高端定制路线</h2>
          <p>
            这份路线不是通用建议，而是把你的六维能力、AI工具短板和18个女性赛道权重一起计算后，生成的30天私人商业启动方案。
          </p>
          <div className="bespoke-metrics" aria-label="定制路线关键指标">
            <Metric label="主攻品类" value={primaryCategory.short} />
            <Metric label="首要补齐" value={ai.weakest} />
          </div>
        </div>

        <div className="route-track">
          {bespokeRoute.map((item, index) => (
            <article className="route-node" key={item.title}>
              <div className="route-index">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{item.period}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <strong>{item.output}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="calculation-section" aria-label="测评计算明细">
        <div className="calculation-head">
          <span className="document-kicker">RESULT METHOD</span>
          <h2>结果如何计算</h2>
          <p>每道题按选项强弱折算为维度分，再进入品类权重矩阵。你看到的等级、Top3和行动建议，全部来自这套计算。</p>
        </div>

        <div className="formula-grid">
          <article>
            <span>01</span>
            <strong>17题商业测评</strong>
            <p>A/B/C/D按4/3/2/1计分，汇总为六维能力百分比，再按维度权重得到商业综合分。</p>
            <em>{business.totalScore}分 · {business.level.level}</em>
          </article>
          <article>
            <span>02</span>
            <strong>18品类权重匹配</strong>
            <p>每个女性赛道都有独立六维权重，按基础匹配、优势共振和短板风险计算后排序。</p>
            <em>{primaryCategory.name} · {primaryCategory.match}%</em>
          </article>
          <article>
            <span>03</span>
            <strong>12题AI工具诊断</strong>
            <p>按提示词、内容生产、自动化、私域、复盘和成本六项生成工具短板。</p>
            <em>{ai.weakest} · {ai.percent[ai.weakest]}分</em>
          </article>
        </div>

        <div className="report-detail-grid">
          <div className="dimension-report-list">
            <h3>六维能力剖面</h3>
            {dimensionReport.map((item) => (
              <article className={`dimension-report-row ${item.tier.tone}`} key={item.dimension}>
                <div className="dimension-row-top">
                  <strong>{item.dimension}</strong>
                  <span>{item.score}分 · 权重{item.weight}% · {item.tier.label}</span>
                </div>
                <div className="match-bar" aria-hidden="true">
                  <i style={{ width: `${item.score}%` }} />
                </div>
                <p>{item.insight}</p>
              </article>
            ))}
          </div>

          <div className="category-rationale-grid">
            <h3>Top3推荐依据</h3>
            {categoryRationales.map((category) => (
              <article className="rationale-card" key={category.name}>
                <div className="rationale-title">
                  <span>0{category.rank}</span>
                  <strong>{category.name}</strong>
                  <em>{category.match}%</em>
                </div>
                <p>{category.reason}</p>
                <div className="driver-row">
                  {category.drivers.map((driver) => (
                    <span key={driver.dimension}>{driver.dimension} {driver.contribution}</span>
                  ))}
                </div>
                <dl>
                  <div><dt>市场</dt><dd>{category.market}</dd></div>
                  <div><dt>增速</dt><dd>{category.growth}</dd></div>
                  <div><dt>门槛</dt><dd>{category.gate}</dd></div>
                  <div><dt>收入</dt><dd>{category.income}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="card-bottom-grid">
        <div className="all-match-panel">
          <h2>18品类匹配结果</h2>
          <div className="category-grid compact">
            {business.categoryMatches.map((category, index) => (
              <button type="button" key={category.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.short}</strong>
                <small>{category.match}%</small>
              </button>
            ))}
          </div>
        </div>
        <div className="deep-insight path-list">
          <h2>30天行动路径</h2>
          <ol>
            <li>第1-7天：定位深化，明确{top[0].name}人群与核心卖点。</li>
            <li>第8-14天：内容生产线搭建，输出10篇高转化内容。</li>
            <li>第15-21天：私域承接与转化，搭建话术SOP。</li>
            <li>第22-30天：首单验证，小单测试到复盘。</li>
          </ol>
        </div>
      </section>
    </main>
  );
}

function AdminLogin({ setView, setAdminLoggedIn }) {
  const [form, setForm] = useState({ account: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const account = form.account.trim();
    setSubmitting(true);
    setError("");
    try {
      await loginAdmin(account, form.password);
      try {
        window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
        window.localStorage.setItem(ADMIN_ACCESS_KEY, form.password);
      } catch {
        // If storage is unavailable, keep the session for this render tree.
      }
      setAdminLoggedIn(true);
      setView("admin");
      return;
    } catch {
      if (account === "admin" && form.password === DEFAULT_ADMIN_PASSWORD) {
        try {
          window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
          window.localStorage.setItem(ADMIN_ACCESS_KEY, form.password);
        } catch {
          // If storage is unavailable, keep the session for this render tree.
        }
        setAdminLoggedIn(true);
        setView("admin");
        return;
      }
      setError("账号或密码不正确。演示账号为 admin / opc2026。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell admin-shell admin-login-shell" style={{ "--admin-wave-bg": `url(${fruitWineWave})` }}>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="document-kicker">ADMIN ACCESS</span>
        <h1 id="admin-login-title">管理员登录</h1>
        <p>查看用户测评记录、跟进状态和品类意向，适合做线索管理和运营复盘。</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>管理员账号</span>
            <input
              autoComplete="username"
              value={form.account}
              onChange={(event) => setForm({ ...form, account: event.target.value })}
              placeholder="admin"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              autoComplete="current-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="opc2026"
            />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "正在验证" : "进入管理后台"} <ShieldCheck size={18} />
          </button>
        </form>
        <div className="admin-demo-note">
          <span>演示账号</span>
          <strong>admin / opc2026</strong>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard({ adminLoggedIn, setAdminLoggedIn, setView }) {
  const [records, setRecords] = useState(() => readAdminRecords());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [selectedId, setSelectedId] = useState(() => readAdminRecords()[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");

  useEffect(() => {
    writeAdminRecords(records);
  }, [records]);

  useEffect(() => {
    if (!adminLoggedIn) return undefined;
    let active = true;
    async function loadRecords() {
      setLoading(true);
      try {
        const remoteRecords = await fetchAdminRecords();
        if (!active) return;
        const nextRecords = remoteRecords.length ? remoteRecords : readAdminRecords();
        setRecords(nextRecords);
        setSelectedId((current) => current || nextRecords[0]?.id || "");
        setRemoteError("");
      } catch {
        if (active) setRemoteError("数据库连接暂时不可用，当前显示本地缓存。");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadRecords();
    return () => {
      active = false;
    };
  }, [adminLoggedIn]);

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return records.filter((record) => {
      const statusMatch = statusFilter === "全部" || record.status === statusFilter;
      const keywordMatch = !keyword || [
        record.name,
        record.phone,
        record.id,
        record.category,
        record.level,
        record.aiWeakness,
        record.owner,
      ].some((value) => String(value).toLowerCase().includes(keyword));
      return statusMatch && keywordMatch;
    });
  }, [query, records, statusFilter]);

  const selectedRecord = records.find((record) => record.id === selectedId) ?? filteredRecords[0] ?? records[0];
  const pendingCount = records.filter((record) => ["待跟进", "待分配"].includes(record.status)).length;
  const highIntentCount = records.filter((record) => record.credit >= 800 || ["L7", "L8", "L9"].includes(record.level)).length;
  const convertedCount = records.filter((record) => record.status === "已转化").length;

  function updateRecordLocal(id, patch) {
    setRecords((current) => current.map((record) => (
      record.id === id ? { ...record, ...patch } : record
    )));
  }

  async function persistRecord(id, patch) {
    updateRecordLocal(id, patch);
    try {
      const updated = await updateAdminRecord(id, patch);
      if (updated) updateRecordLocal(id, updated);
      setRemoteError("");
    } catch {
      setRemoteError("这次修改没有同步到数据库，请稍后重试。");
    }
  }

  async function deleteRecord(id) {
    const confirmed = window.confirm("确认删除这条用户记录吗？");
    if (!confirmed) return;
    const previousRecords = records;
    setRecords((current) => current.filter((record) => record.id !== id));
    if (selectedId === id) {
      const next = records.find((record) => record.id !== id);
      setSelectedId(next?.id ?? "");
    }
    try {
      await deleteAdminRecord(id);
      setRemoteError("");
    } catch {
      setRecords(previousRecords);
      setRemoteError("删除没有同步到数据库，请稍后重试。");
    }
  }

  function logout() {
    try {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      window.localStorage.removeItem(ADMIN_ACCESS_KEY);
    } catch {
      // Ignore storage errors.
    }
    setAdminLoggedIn(false);
    setView("home");
  }

  if (!adminLoggedIn) {
    return (
      <main className="page-shell admin-shell" style={{ "--admin-wave-bg": `url(${fruitWineWave})` }}>
        <section className="admin-login-card">
          <span className="document-kicker">ADMIN ACCESS</span>
          <h1>需要管理员登录</h1>
          <p>登录后可以查看用户测评记录和管理跟进状态。</p>
          <button className="primary-btn" type="button" onClick={() => setView("admin-login")}>
            去登录 <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell admin-shell admin-dashboard-shell" style={{ "--admin-wave-bg": `url(${fruitWineWave})` }}>
      <section className="admin-dashboard-head">
        <div>
          <span className="document-kicker">OPC ADMIN CONSOLE</span>
          <h1>用户测评管理</h1>
          <p>{loading ? "正在同步最新测评记录..." : "集中查看商业测评、AI工具短板、OPC等级、推荐品类和跟进状态。"}</p>
          {remoteError && <p className="admin-sync-note" role="status">{remoteError}</p>}
        </div>
        <button className="ghost-btn" type="button" onClick={logout}>
          <SignOut size={18} /> 退出
        </button>
      </section>

      <section className="admin-stat-grid" aria-label="后台关键指标">
        <AdminStat icon={UsersThree} label="用户记录" value={records.length} />
        <AdminStat icon={ChartLineUp} label="高意向用户" value={highIntentCount} />
        <AdminStat icon={FunnelSimple} label="待处理" value={pendingCount} />
        <AdminStat icon={CheckCircle} label="已转化" value={convertedCount} />
      </section>

      <section className="admin-workbench">
        <div className="admin-records-panel">
          <div className="admin-toolbar">
            <label className="admin-search">
              <MagnifyingGlass size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索姓名、手机、品类、等级"
                aria-label="搜索用户记录"
              />
            </label>
            <label className="admin-filter">
              <span>状态</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="按状态筛选">
                <option>全部</option>
                {adminStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>等级</th>
                  <th>推荐品类</th>
                  <th>AI短板</th>
                  <th>状态</th>
                  <th>顾问</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr className={record.id === selectedRecord?.id ? "selected" : ""} key={record.id}>
                    <td>
                      <button className="admin-user-cell" type="button" onClick={() => setSelectedId(record.id)}>
                        <strong>{record.name}</strong>
                        <span>{record.phone}</span>
                      </button>
                    </td>
                    <td><strong>{record.level}</strong><span>{record.credit}</span></td>
                    <td>{record.category}<small>{record.match}%</small></td>
                    <td>{record.aiWeakness}</td>
                    <td>
                      <select
                        value={record.status}
                        onChange={(event) => persistRecord(record.id, { status: event.target.value })}
                        aria-label={`${record.name}状态`}
                      >
                        {adminStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        value={record.owner}
                        onChange={(event) => persistRecord(record.id, { owner: event.target.value })}
                        aria-label={`${record.name}顾问`}
                      >
                        {adminOwners.map((owner) => <option key={owner}>{owner}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => setSelectedId(record.id)} aria-label={`查看${record.name}`}>
                          <Eye size={16} />
                        </button>
                        <button type="button" onClick={() => deleteRecord(record.id)} aria-label={`删除${record.name}`}>
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredRecords.length && <p className="admin-empty">没有符合条件的记录。</p>}
          </div>
        </div>

        {selectedRecord && (
          <aside className="admin-detail-panel" aria-label="用户记录详情">
            <div className="admin-detail-top">
              <span>{selectedRecord.id}</span>
              <strong>{selectedRecord.status}</strong>
            </div>
            <div className="admin-profile-mini">
              <span>{selectedRecord.name.slice(0, 1)}</span>
              <div>
                <h2>{selectedRecord.name}</h2>
                <p>{selectedRecord.phone} · {selectedRecord.createdAt}</p>
              </div>
            </div>
            <div className="admin-detail-metrics">
              <Metric label="OPC等级" value={`${selectedRecord.level} ${selectedRecord.levelName}`} />
              <Metric label="她信分" value={selectedRecord.credit} />
              <Metric label="商业测评" value={`${selectedRecord.businessScore}分`} />
            </div>
            <div className="admin-detail-list">
              <div><span>推荐品类</span><strong>{selectedRecord.category} · {selectedRecord.match}%</strong></div>
              <div><span>AI工具短板</span><strong>{selectedRecord.aiWeakness}</strong></div>
              <div><span>来源</span><strong>{selectedRecord.source}</strong></div>
              <div><span>负责顾问</span><strong>{selectedRecord.owner}</strong></div>
            </div>
            <label className="admin-note-field">
              <span>跟进备注</span>
              <textarea
                value={selectedRecord.note}
                onChange={(event) => updateRecordLocal(selectedRecord.id, { note: event.target.value })}
                onBlur={(event) => persistRecord(selectedRecord.id, { note: event.target.value })}
                rows={5}
              />
            </label>
            <div className="admin-detail-actions">
              <button type="button" className="primary-btn compact" onClick={() => persistRecord(selectedRecord.id, { status: "已联系" })}>
                标记已联系
              </button>
              <button type="button" className="ghost-btn" onClick={() => persistRecord(selectedRecord.id, { status: "已转化" })}>
                标记已转化
              </button>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}

function AdminStat({ icon: Icon, label, value }) {
  return (
    <article className="admin-stat-card">
      <span><Icon size={24} weight="duotone" /></span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InsightCard({ title, text }) {
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function creditScore(business) {
  return Math.min(960, Math.max(520, Math.round(520 + business.totalScore * 4)));
}

function RadarChart({ scores, compact = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = compact ? 180 : 300;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, size, size);
    const center = size / 2;
    const radius = compact ? 62 : 105;
    const values = dimensions.map((dim) => scores[dim] ?? 0);
    const angleStep = (Math.PI * 2) / dimensions.length;

    ctx.strokeStyle = "rgba(122, 59, 82, 0.15)";
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring += 1) {
      ctx.beginPath();
      dimensions.forEach((_, index) => {
        const angle = -Math.PI / 2 + index * angleStep;
        const pointRadius = radius * (ring / 4);
        const x = center + Math.cos(angle) * pointRadius;
        const y = center + Math.sin(angle) * pointRadius;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    ctx.beginPath();
    values.forEach((value, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const pointRadius = radius * (value / 100);
      const x = center + Math.cos(angle) * pointRadius;
      const y = center + Math.sin(angle) * pointRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(122, 59, 82, 0.16)";
    ctx.strokeStyle = "#7A3B52";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    if (!compact) {
      ctx.fillStyle = "#6F5862";
      ctx.font = "12px 'Microsoft YaHei', sans-serif";
      dimensions.forEach((dim, index) => {
        const angle = -Math.PI / 2 + index * angleStep;
        const labelRadius = radius + 28;
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;
        ctx.textAlign = x < center - 8 ? "right" : x > center + 8 ? "left" : "center";
        ctx.fillText(dim, x, y);
      });
    }
  }, [scores, compact]);

  return <canvas className="radar-canvas" ref={canvasRef} aria-label="六维能力雷达图" />;
}

export function App() {
  const [view, setView] = useState("home");
  const [answers, setAnswers] = useState([]);
  const [aiAnswers, setAiAnswers] = useState([]);
  const [sessionRecordId, setSessionRecordId] = useState(() => `OPC-${Date.now().toString(36).toUpperCase()}`);
  const [leadInfo, setLeadInfo] = useState(() => readStoredLeadInfo());
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });

  const businessResult = useMemo(() => (
    answers.length ? calculateBusiness(answers) : null
  ), [answers]);
  const aiResult = useMemo(() => (
    aiAnswers.length ? calculateAi(aiAnswers) : null
  ), [aiAnswers]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [view]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealSelector = [
      ".editorial-copy",
      ".luxury-dossier",
      ".chapter-strip",
      ".taxonomy-section",
      ".mobile-dossier-showcase",
      ".mobile-process-ledger",
      ".mobile-closing-band",
      ".lead-intake-card",
      ".flow-stepper",
      ".side-summary",
      ".question-panel",
      ".category-pool",
      ".dimension-band",
      ".card-title-row",
      ".opc-master-card",
      ".action-column",
      ".bespoke-route-section",
      ".calculation-section",
      ".card-bottom-grid",
      ".mobile-result-dossier",
      ".mobile-report-band",
      ".mobile-report-actions",
      ".admin-dashboard-head",
      ".admin-stat-card",
      ".admin-records-panel",
      ".admin-detail-panel",
    ].join(", ");
    let observer;
    const frame = window.requestAnimationFrame(() => {
      const nodes = Array.from(document.querySelectorAll(revealSelector));
      nodes.forEach((node, index) => {
        node.classList.add("motion-reveal");
        node.style.setProperty("--motion-order", String(Math.min(index, 8)));
      });
      if (reducedMotion || !("IntersectionObserver" in window)) {
        nodes.forEach((node) => node.classList.add("is-visible"));
        return;
      }
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, {
        rootMargin: "0px 0px -3% 0px",
        threshold: 0.07,
      });
      nodes.forEach((node) => observer.observe(node));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
    };
  }, [view]);

  function startAssessment() {
    if (!hasLeadInfo(leadInfo)) {
      setView("lead");
      return;
    }
    setAnswers([]);
    setAiAnswers([]);
    setSessionRecordId(`OPC-${Date.now().toString(36).toUpperCase()}`);
    setView("business");
  }

  function handleLeadSubmit(info) {
    setLeadInfo(info);
    writeStoredLeadInfo(info);
    setAnswers([]);
    setAiAnswers([]);
    setSessionRecordId(`OPC-${Date.now().toString(36).toUpperCase()}`);
    setView("business");
  }

  function navigateView(nextView) {
    if (nextView === "business" || nextView === "ai") {
      if (!hasLeadInfo(leadInfo)) {
        setView("lead");
        return;
      }
      if (nextView === "ai" && !businessResult) {
        setView("business");
        return;
      }
    }
    setView(nextView);
  }

  return (
    <>
      <AppHeader view={view} onNavigate={navigateView} adminLoggedIn={adminLoggedIn} />
      {view === "home" && <HomePage setView={setView} onStart={startAssessment} businessResult={businessResult} />}
      {view === "lead" && (
        <LeadCapture initialLead={leadInfo} onSubmit={handleLeadSubmit} onBack={() => setView("home")} />
      )}
      {view === "business" && (
        <BusinessAssessment answers={answers} setAnswers={setAnswers} setView={setView} businessResult={businessResult} />
      )}
      {view === "ai" && (
        <AiAssessment aiAnswers={aiAnswers} setAiAnswers={setAiAnswers} setView={setView} businessResult={businessResult} aiResult={aiResult} />
      )}
      {view === "card" && (
        <PositioningCard
          businessResult={businessResult}
          aiResult={aiResult}
          setView={setView}
          sessionRecordId={sessionRecordId}
          leadInfo={leadInfo}
          businessAnswers={answers}
          aiAnswers={aiAnswers}
        />
      )}
      {view === "admin-login" && <AdminLogin setView={setView} setAdminLoggedIn={setAdminLoggedIn} />}
      {view === "admin" && (
        <AdminDashboard
          adminLoggedIn={adminLoggedIn}
          setAdminLoggedIn={setAdminLoggedIn}
          setView={setView}
        />
      )}
    </>
  );
}
