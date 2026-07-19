import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
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
  LockKey,
  PencilSimple,
  Phone,
  ShareNetwork,
  ShieldCheck,
  SignOut,
  Target,
  Trash,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import atelierPaperTransition from "./assets/atelier-paper-transition.jpg";
import dustyBlushPaper from "./assets/dusty-blush-paper.jpg";
import fruitWineWave from "./assets/fruit-wine-wave.webp";
import oxbloodVelvet from "./assets/oxblood-velvet.jpg";
import tzhSignatureFlow from "./assets/tzh-signature-flow-v2.webp";
import {
  aiQuestions,
  calculateAi as calculateAiCore,
  calculateBusiness as calculateBusinessCore,
  categoryWeights,
  commercialQuestions,
  creditScore as calculateCreditScore,
  dimensionMeta,
  dimensions,
  isAssessmentComplete,
} from "./assessment.js";
import { aiToolCatalog, toolsByIds, toolsForArea } from "./aiTools.js";
import {
  buildBespokeRoute,
  buildCategoryRationales,
  getAiSolution,
  getLevelGrowthPlan,
} from "./resultLogic.js";

const stepLabels = [
  { key: "business", label: "商业潜力测评", desc: "17题六维能力" },
  { key: "ai", label: "AI工具能力测评", desc: "工具短板诊断" },
  { key: "card", label: "OPC定位卡", desc: "合成最终画像" },
];

const ADMIN_RECORDS_KEY = "opc-admin-records";
const LEAD_INFO_KEY = "opc-lead-info";
const PENDING_ASSESSMENT_KEY = "opc-pending-assessment";

const assessmentMeta = {
  business: {
    eyebrow: "COMMERCIAL CAPABILITY · 17 QUESTIONS",
    title: "商业能力测评",
    shortTitle: "商业测评",
    description: "看清六维商业能力、OPC等级与最适合你的女性赛道。",
    detail: "17道情境题，从内容、商业判断、AI工具、销售、学习与影响力六个维度，计算你的真实商业潜力。",
    duration: "约3分钟",
    output: "六维图谱 · L1-L9等级 · Top3赛道",
    path: "/assessments/business",
  },
  ai: {
    eyebrow: "AI TOOL READINESS · 12 QUESTIONS",
    title: "AI工具测评",
    shortTitle: "AI测评",
    description: "识别你的AI工作流成熟度，找到最需要补齐的工具环节。",
    detail: "12道情境题，覆盖提示词、内容生产、自动化、私域、数据复盘与工具成本，给出一条可执行的升级建议。",
    duration: "约3分钟",
    output: "六项能力 · 核心短板 · 工具行动建议",
    path: "/assessments/ai",
  },
  opc: {
    eyebrow: "PRIVATE OPC DOSSIER · COMPLETE JOURNEY",
    title: "OPC综合定位",
    shortTitle: "OPC定位",
    description: "把商业能力与AI工具能力合并，生成你的个人商业定位档案。",
    detail: "依次完成商业能力与AI工具测评，在18个女性赛道中计算Top3，生成等级、定位、短板与30天启动路径。",
    duration: "约6分钟",
    output: "个人定位卡 · 18赛道 · 30天启动路线",
    path: "/assessments/opc",
  },
};

const assessmentSharePaths = {
  business: "/商业测评.html",
  ai: "/AI工具测评.html",
  opc: "/OPC定位卡.html",
};

const viewPaths = {
  home: "/",
  "business-intro": assessmentMeta.business.path,
  business: `${assessmentMeta.business.path}/test`,
  "business-result": `${assessmentMeta.business.path}/result`,
  "ai-intro": assessmentMeta.ai.path,
  ai: `${assessmentMeta.ai.path}/test`,
  "ai-result": `${assessmentMeta.ai.path}/result`,
  "opc-intro": assessmentMeta.opc.path,
  card: `${assessmentMeta.opc.path}/result`,
  "ai-tools": "/ai-tools",
  login: "/login",
  account: "/account",
  "admin-login": "/admin/login",
  admin: "/admin",
};

const viewAliases = {
  "/商业测评.html": "business-intro",
  "/AI工具测评.html": "ai-intro",
  "/OPC定位卡.html": "opc-intro",
  "/AI工具推荐.html": "ai-tools",
};

function viewFromPath(pathname) {
  let decodedPath = pathname;
  try {
    decodedPath = decodeURI(pathname);
  } catch {
    decodedPath = pathname;
  }
  const normalized = decodedPath !== "/" ? decodedPath.replace(/\/+$/, "") : decodedPath;
  if (viewAliases[normalized]) return viewAliases[normalized];
  const match = Object.entries(viewPaths).find(([, path]) => path === normalized);
  if (!match) return "home";
  if (["business", "business-result", "ai", "ai-result", "card"].includes(match[0])) {
    return match[0].endsWith("result") || match[0] === "card"
      ? match[0].replace("business-result", "business-intro").replace("ai-result", "ai-intro").replace("card", "opc-intro")
      : match[0];
  }
  return match[0];
}

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
const adminMetricFilters = {
  all: { label: "用户记录" },
  intent: { label: "高意向用户" },
  pending: { label: "待处理" },
  converted: { label: "已转化" },
};

function highIntentSignals(record) {
  const signals = [];
  if (Number(record.credit) >= 800) signals.push({ key: "credit", label: `她信分 ${record.credit}` });
  if (["L7", "L8", "L9"].includes(record.level)) signals.push({ key: "level", label: `OPC ${record.level}` });
  if (Number(record.match) >= 80) signals.push({ key: "match", label: `Top1 ${record.match}%` });
  return signals;
}

function highIntentPriority(record) {
  const levelValue = Number.parseInt(String(record.level || "").replace("L", ""), 10) || 0;
  return highIntentSignals(record).length * 1000
    + (Number(record.credit) || 0)
    + levelValue * 10
    + (Number(record.match) || 0);
}

function formatAdminRecordTime(value) {
  if (!value) return "—";
  return String(value).replace("T", " ").replace("Z", "").slice(0, 16);
}

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

function buildAssessmentRecord(recordId, assessmentType, business, ai, leadInfo = {}) {
  const primary = business?.recommendedCategories?.[0] ?? null;
  const name = leadInfo.name?.trim() || "当前访客";
  const phone = leadInfo.phone?.trim() || "未留资";
  const source = assessmentMeta[assessmentType]?.title || "完整OPC测评";
  const note = assessmentType === "business"
    ? `主推${primary?.short || "待计算"}，商业潜力${business?.totalScore ?? 0}分。`
    : assessmentType === "ai"
      ? `AI工具短板为${ai?.weakest || "待计算"}，综合熟练度${ai?.total ?? 0}分。`
      : `主推${primary?.short || "待计算"}，优先补${ai?.weakest || "AI工具流程"}。`;
  return {
    id: recordId,
    assessmentType,
    name,
    phone,
    createdAt: formatAdminTime(),
    level: business?.level?.level || "",
    levelName: business?.level?.name || "",
    businessScore: business?.totalScore ?? null,
    aiScore: ai?.total ?? null,
    credit: business ? creditScore(business) : null,
    category: primary?.name || "",
    match: primary?.match ?? null,
    aiWeakness: ai?.weakest || "",
    status: "待跟进",
    owner: "未分配",
    source,
    note,
  };
}

function buildAdminRecord(recordId, business, ai, leadInfo = {}) {
  return buildAssessmentRecord(recordId, "opc", business, ai, leadInfo);
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

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
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

async function saveAssessmentRecord({ assessmentType = "opc", record, business, ai, businessAnswers = [], aiAnswers = [] }) {
  upsertAdminRecord({
    ...record,
    assessmentType,
    businessResult: business,
    aiResult: ai,
    businessAnswers,
    aiAnswers,
  });
  const payload = await requestJson("/api/records", {
    method: "POST",
    body: JSON.stringify({
      assessmentType,
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

async function registerUser(form) {
  const payload = await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(form),
  });
  return payload.user;
}

async function loginUser(form) {
  const payload = await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(form),
  });
  return payload.user;
}

async function fetchCurrentUser() {
  const payload = await requestJson("/api/auth/me");
  return payload.user ?? null;
}

async function logoutUser() {
  return requestJson("/api/auth/logout", { method: "POST", body: "{}" });
}

async function fetchUserRecords() {
  const payload = await requestJson("/api/me/records");
  return Array.isArray(payload.records) ? payload.records : [];
}

async function shareAssessment(type, setFeedback) {
  const meta = assessmentMeta[type];
  const url = new URL(assessmentSharePaths[type] || meta.path, window.location.origin).toString();
  try {
    if (navigator.share) {
      await navigator.share({ title: `她智汇｜${meta.title}`, text: meta.description, url });
      setFeedback?.("已打开分享");
    } else {
      await navigator.clipboard.writeText(url);
      setFeedback?.("链接已复制");
    }
  } catch (error) {
    if (error?.name !== "AbortError") setFeedback?.("暂时无法分享");
  }
}

async function fetchAdminRecords() {
  const payload = await requestJson("/api/records");
  return Array.isArray(payload.records) ? payload.records : [];
}

async function loginAdmin(account, password) {
  const payload = await requestJson("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ account, password }),
  });
  return payload.admin;
}

async function fetchCurrentAdmin() {
  const payload = await requestJson("/api/admin/me");
  return payload.admin ?? null;
}

async function logoutAdmin() {
  return requestJson("/api/admin/logout", { method: "POST", body: "{}" });
}

async function fetchAdminUsers() {
  const payload = await requestJson("/api/admin/users");
  return Array.isArray(payload.users) ? payload.users : [];
}

async function fetchAdvisors() {
  const payload = await requestJson("/api/admin/advisors");
  return Array.isArray(payload.advisors) ? payload.advisors : [];
}

async function createAdvisor(form) {
  const payload = await requestJson("/api/admin/advisors", {
    method: "POST",
    body: JSON.stringify(form),
  });
  return payload.advisor;
}

async function setAdvisorActive(id, active) {
  const payload = await requestJson(`/api/admin/advisors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
  return payload.advisor;
}

async function updateAdminRecord(id, patch) {
  const payload = await requestJson(`/api/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return payload.record;
}

async function deleteAdminRecord(id) {
  return requestJson(`/api/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

function fallbackAnswers(questions) {
  return questions.map((_, index) => index % 4 === 0 ? 0 : index % 3 === 0 ? 2 : 1);
}

function calculateBusiness(answers) {
  return calculateBusinessCore(answers);
}

function calculateAi(answers) {
  return calculateAiCore(answers);
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

function AppHeader({ view, onNavigate, adminLoggedIn, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = [
    ["home", "首页"],
    ["business-intro", "商业测评"],
    ["ai-intro", "AI工具测评"],
    ["opc-intro", "OPC定位"],
    ["ai-tools", "AI工具库"],
  ];

  const activeNav = view === "ai-tools"
    ? "ai-tools"
    : view.startsWith("business")
    ? "business-intro"
    : view.startsWith("ai")
      ? "ai-intro"
      : view === "card" || view === "opc-intro"
        ? "opc-intro"
        : view;

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
            className={activeNav === key ? "active" : ""}
            key={key}
            type="button"
            aria-current={activeNav === key ? "page" : undefined}
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
                className={activeNav === key ? "active" : ""}
                key={key}
                type="button"
                aria-current={activeNav === key ? "page" : undefined}
                onClick={() => navigateTo(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <button className="mobile-account-link" type="button" onClick={() => navigateTo(currentUser ? "account" : "login")}>
            <UserCircle size={19} /> {currentUser ? `${currentUser.name}的测评档案` : "登录 / 注册"}
          </button>
          <button className="mobile-admin-link" type="button" onClick={() => navigateTo(adminLoggedIn ? "admin" : "admin-login")}>
            {adminLoggedIn ? "进入管理后台" : "管理员登录"}
          </button>
        </div>
      )}
      <button
        className="auth-pill"
        type="button"
        aria-current={view === "account" || view === "login" ? "page" : undefined}
        onClick={() => navigateTo(currentUser ? "account" : "login")}
      >
        <UserCircle size={19} weight="light" />
        {currentUser ? currentUser.name : "登录 / 注册"}
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

function AssessmentEntry({ type, onStart, onNavigate }) {
  const meta = assessmentMeta[type];
  const [shareFeedback, setShareFeedback] = useState("");
  const sequence = type === "business"
    ? ["六维商业能力", "L1-L9等级", "女性赛道Top3"]
    : type === "ai"
      ? ["六项AI能力", "优先短板", "效率升级动作"]
      : ["商业能力", "AI工具能力", "个人OPC定位卡"];

  useEffect(() => {
    if (!shareFeedback) return undefined;
    const timer = window.setTimeout(() => setShareFeedback(""), 1800);
    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  return (
    <main className={`page-shell assessment-entry-shell assessment-entry-${type}`} style={{ "--entry-velvet": `url(${oxbloodVelvet})` }}>
      <section className="assessment-entry-hero">
        <div className="entry-hero-copy">
          <button className="entry-back" type="button" onClick={() => onNavigate("home")}>
            <ArrowLeft size={17} /> 返回首页
          </button>
          <span className="document-kicker">{meta.eyebrow}</span>
          <h1>{meta.title}</h1>
          <p className="entry-lead">{meta.description}</p>
          <p className="entry-detail">{meta.detail}</p>
          <div className="entry-facts" aria-label="测评信息">
            <span>{meta.duration}</span>
            <span>{meta.output}</span>
          </div>
          <div className="entry-actions">
            <button className="entry-primary" type="button" onClick={() => onStart(type)}>
              开始{meta.shortTitle} <ArrowRight size={19} />
            </button>
            <button className="entry-share" type="button" onClick={() => shareAssessment(type, setShareFeedback)}>
              <ShareNetwork size={19} /> {shareFeedback || "分享这个测评"}
            </button>
          </div>
        </div>
        <div className="entry-index-panel" aria-label="结果生成路径">
          <span>PRIVATE ASSESSMENT</span>
          <strong>0{type === "business" ? 1 : type === "ai" ? 2 : 3}</strong>
          <ol>
            {sequence.map((item, index) => (
              <li key={item}><em>{String(index + 1).padStart(2, "0")}</em><span>{item}</span></li>
            ))}
          </ol>
          <small>FOR HER · BY HER</small>
        </div>
      </section>

      <section className="assessment-entry-switcher" aria-label="其他测评">
        <div>
          <span>THREE INDEPENDENT ASSESSMENTS</span>
          <h2>也可以单独完成另外两项</h2>
        </div>
        <div className="entry-switcher-links">
          {Object.entries(assessmentMeta).map(([key, item]) => (
            <button className={key === type ? "active" : ""} type="button" key={key} onClick={() => onNavigate(`${key}-intro`)}>
              <span>0{key === "business" ? 1 : key === "ai" ? 2 : 3}</span>
              <strong>{item.title}</strong>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function UserAuthPage({ onAuthenticated, onNavigate }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = mode === "register"
        ? await registerUser(form)
        : await loginUser({ phone: form.phone, password: form.password });
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.message || "登录失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="user-auth-shell" style={{ "--auth-velvet": `url(${oxbloodVelvet})` }}>
      <section className="auth-editorial-panel">
        <button className="auth-back" type="button" onClick={() => onNavigate("home")}>
          <ArrowLeft size={18} /> 返回她智汇
        </button>
        <div className="auth-editorial-copy">
          <span>PRIVATE MEMBER ARCHIVE</span>
          <h1>让每一次测评，<br />成为你的商业档案。</h1>
          <p>登录后保存商业能力、AI工具与OPC定位结果。换一台设备，也能继续查看自己的成长记录。</p>
        </div>
        <div className="auth-signature-row">
          <strong className="atelier-signature">她智汇</strong>
          <span>FOR HER · BY HER</span>
        </div>
      </section>

      <section className="auth-form-panel" aria-labelledby="user-auth-title">
        <div className="auth-form-inner">
          <span className="document-kicker">MEMBER ACCESS</span>
          <h2 id="user-auth-title">{mode === "login" ? "欢迎回来" : "建立你的私人档案"}</h2>
          <p>{mode === "login" ? "登录后查看并继续你的测评记录。" : "只需一次注册，三项测评会自动归入你的账号。"}</p>
          <div className="auth-mode-tabs" role="tablist" aria-label="登录或注册">
            <button className={mode === "login" ? "active" : ""} type="button" role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setError(""); }}>登录</button>
            <button className={mode === "register" ? "active" : ""} type="button" role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>注册</button>
          </div>
          <form className="user-auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label>
                <span>姓名</span>
                <div><UserCircle size={20} /><input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="你的姓名" required /></div>
              </label>
            )}
            <label>
              <span>手机号</span>
              <div><Phone size={20} /><input type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="用于登录和保存结果" required /></div>
            </label>
            <label>
              <span>密码</span>
              <div><LockKey size={20} /><input type="password" minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="至少8位" required /></div>
            </label>
            {error && <p className="user-auth-error" role="alert">{error}</p>}
            <button className="user-auth-submit" type="submit" disabled={submitting}>
              {submitting ? "正在进入" : mode === "login" ? "登录我的档案" : "注册并继续"} <ArrowRight size={18} />
            </button>
          </form>
          <button className="admin-entry-link" type="button" onClick={() => onNavigate("admin-login")}>管理员入口</button>
        </div>
      </section>
    </main>
  );
}

function UserAccountPage({ currentUser, onNavigate, onLogout }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    let active = true;
    fetchUserRecords()
      .then((items) => { if (active) setRecords(items); })
      .catch((requestError) => { if (active) setError(requestError.message || "记录加载失败。"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function recordSummary(record) {
    if (record.assessmentType === "ai") return `${record.aiScore ?? 0}分 · 优先补齐${record.aiWeakness || "工具流程"}`;
    if (record.assessmentType === "business") return `${record.level} ${record.levelName} · ${record.category}`;
    return `${record.level} ${record.levelName} · ${record.category} · AI短板${record.aiWeakness}`;
  }

  return (
    <main className="page-shell account-shell">
      <section className="account-head">
        <div>
          <span className="document-kicker">PRIVATE MEMBER ARCHIVE</span>
          <h1>{currentUser.name}的测评档案</h1>
          <p>{currentUser.phone} · 你的三项测评结果都会保存在这里。</p>
        </div>
        <button className="account-logout" type="button" onClick={onLogout}><SignOut size={18} />退出登录</button>
      </section>

      <section className="account-overview" aria-label="测评概览">
        {Object.entries(assessmentMeta).map(([type, meta], index) => {
          const count = records.filter((record) => record.assessmentType === type).length;
          return (
            <article key={type}>
              <span>0{index + 1}</span>
              <div><strong>{meta.title}</strong><small>{count ? `已完成 ${count} 次` : "尚未完成"}</small></div>
              <button type="button" onClick={() => onNavigate(`${type}-intro`)}>{count ? "再次测评" : "开始测评"}<ArrowRight size={16} /></button>
            </article>
          );
        })}
      </section>

      <section className="account-record-section">
        <div className="account-section-title">
          <div><span>ASSESSMENT HISTORY</span><h2>我的历史结果</h2></div>
          <strong>{records.length} 份档案</strong>
        </div>
        {loading && <p className="account-state">正在整理你的测评档案...</p>}
        {error && <p className="account-state is-error" role="alert">{error}</p>}
        {!loading && !error && !records.length && (
          <div className="account-empty"><strong>还没有测评记录</strong><p>从一项独立测评开始，结果会自动保存到这里。</p><button type="button" onClick={() => onNavigate("business-intro")}>开始商业测评 <ArrowRight size={17} /></button></div>
        )}
        <div className="account-record-list">
          {records.map((record) => {
            const type = record.assessmentType || "opc";
            const meta = assessmentMeta[type] || assessmentMeta.opc;
            return (
              <article className={`account-record account-record-${type}`} key={record.id}>
                <div className="account-record-index"><span>{meta.shortTitle}</span><strong>{type === "ai" ? record.aiScore : record.level || "OPC"}</strong></div>
                <div className="account-record-main"><small>{record.createdAt?.replace("T", " ").slice(0, 16)}</small><h3>{recordSummary(record)}</h3><p>{record.note}</p></div>
                <div className="account-record-actions">
                  <button type="button" onClick={() => shareAssessment(type, (message) => { setShareFeedback(`${record.id}:${message}`); window.setTimeout(() => setShareFeedback(""), 1800); })}><ShareNetwork size={17} />{shareFeedback.startsWith(record.id) ? shareFeedback.split(":")[1] : "分享测评"}</button>
                  <button type="button" onClick={() => onNavigate(`${type}-intro`)}>重新测评 <ArrowRight size={16} /></button>
                </div>
                {(record.businessResult || record.aiResult) && (
                  <details className="account-record-detail">
                    <summary>查看详细结果</summary>
                    {record.businessResult && <><p><strong>商业总分</strong>{record.businessResult.totalScore} / 100</p><p><strong>最强维度</strong>{record.businessResult.strongestDim}</p><p><strong>Top3赛道</strong>{record.businessResult.recommendedCategories?.map((item) => `${item.short} ${item.match}%`).join(" · ")}</p></>}
                    {record.assessmentType === "opc" && !record.reportUnlocked ? (
                      <div className="account-report-locked"><LockKey size={18} /><span>完整能力图、AI解决方案和30天路径尚未开放。添加微信 <strong>Her-AICircle</strong> 获取解读。</span></div>
                    ) : record.aiResult && <><p><strong>AI总分</strong>{record.aiResult.total} / 100</p><p><strong>最强能力</strong>{record.aiResult.strongest}</p><p><strong>优先短板</strong>{record.aiResult.weakest}</p></>}
                  </details>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function AiToolsPage({ onNavigate }) {
  const [activeArea, setActiveArea] = useState("全部");
  const areas = ["全部", "提示词库", "内容生产", "自动化流程", "私域工具", "数据复盘", "工具成本"];
  const tools = activeArea === "全部" ? aiToolCatalog : toolsForArea(activeArea);

  function downloadToolGuide() {
    const headings = ["工具", "提供方", "适用环节", "推荐理由", "官方链接"];
    const rows = tools.map((tool) => [tool.name, tool.provider, tool.areas.join(" / "), tool.description, tool.url]);
    const csv = [headings, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `她智汇-AI工具清单-${activeArea}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page-shell ai-tool-library-shell">
      <section className="ai-tool-library-hero">
        <button className="entry-back" type="button" onClick={() => onNavigate("ai-intro")}><ArrowLeft size={17} />返回AI测评</button>
        <span className="document-kicker">CURATED AI TOOL LIBRARY</span>
        <h1>把工具放进流程，<br />而不是放进收藏夹。</h1>
        <p>按六项AI能力整理的官方工具入口。先解决一个明确短板，再增加新的订阅。</p>
        <button className="ai-tool-download" type="button" onClick={downloadToolGuide}><DownloadSimple size={18} />下载当前工具清单</button>
      </section>
      <section className="ai-tool-library-content">
        <div className="ai-tool-area-tabs" role="tablist" aria-label="按AI能力筛选工具">
          {areas.map((area) => <button className={activeArea === area ? "active" : ""} type="button" role="tab" aria-selected={activeArea === area} onClick={() => setActiveArea(area)} key={area}>{area}</button>)}
        </div>
        <div className="ai-tool-card-grid">
          {tools.map((tool, index) => (
            <article className="ai-tool-card" key={tool.id}>
              <div><span>{String(index + 1).padStart(2, "0")}</span><small>{tool.tag}</small></div>
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <div className="ai-tool-card-meta"><span>{tool.provider}</span><span>{tool.access}</span></div>
              <a href={tool.url} target="_blank" rel="noreferrer">打开官方入口 <ArrowRight size={16} /></a>
            </article>
          ))}
        </div>
      </section>
    </main>
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
        <div className="taxonomy-board">
          <div className="taxonomy-board-head">
            <div>
              <span>SELECT YOUR CATEGORY</span>
              <h3>18个赛道，全景候选池</h3>
            </div>
            <p>能力权重 × 市场机会 × 启动门槛</p>
          </div>
          <CategoryGrid />
        </div>
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
        <img className="atelier-signature-art" src={tzhSignatureFlow} alt="" />
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
        <article key={category.name}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{category.short}</strong>
            <small>{category.gate} · {category.market}</small>
          </div>
          <em><b>{category.growth}</b> 增速</em>
        </article>
      ))}
    </div>
  );
}

function StandaloneAssessmentHead({ type, onBack }) {
  const meta = assessmentMeta[type];
  return (
    <section className="standalone-assessment-head">
      <button type="button" onClick={onBack}><ArrowLeft size={17} />退出测评</button>
      <div><span>{meta.eyebrow}</span><strong>{meta.title}</strong></div>
      <small>{meta.duration}</small>
    </section>
  );
}

function BusinessStandaloneResult({ businessResult, answers, sessionRecordId, leadInfo, setView }) {
  const business = businessResult ?? calculateBusiness(fallbackAnswers(commercialQuestions));
  const [saveState, setSaveState] = useState("正在保存");
  const [shareFeedback, setShareFeedback] = useState("");
  const savedKey = useRef("");

  useEffect(() => {
    if (!businessResult || !hasLeadInfo(leadInfo)) return;
    const record = buildAssessmentRecord(sessionRecordId, "business", business, null, leadInfo);
    const key = `${record.id}:${record.businessScore}`;
    if (savedKey.current === key) return;
    savedKey.current = key;
    saveAssessmentRecord({ assessmentType: "business", record, business, businessAnswers: answers })
      .then(() => setSaveState("已保存到我的档案"))
      .catch(() => { savedKey.current = ""; setSaveState("保存失败，请稍后重试"); });
  }, [answers, business, businessResult, leadInfo, sessionRecordId]);

  return (
    <main className="page-shell standalone-result-shell business-result-shell">
      <section className="standalone-result-hero">
        <div>
          <span className="document-kicker">COMMERCIAL CAPABILITY RESULT</span>
          <h1>你的商业能力，<br />已经形成清晰轮廓。</h1>
          <p>{leadInfo?.name}，你当前处于 <strong>{business.level.level} · {business.level.name}</strong>，最值得放大的能力是{business.strongestDim}。</p>
          <small>{saveState}</small>
        </div>
        <div className="standalone-result-score"><span>商业综合分</span><strong>{business.totalScore}</strong><small>/ 100</small></div>
      </section>

      <section className="business-result-grid">
        <div className="result-radar-panel">
          <div><span>01 · CAPABILITY MAP</span><h2>六维商业能力</h2></div>
          <RadarChart scores={business.percentScores} />
          <p className="sr-only">{dimensions.map((dimension) => `${dimension}${business.percentScores[dimension]}分`).join("，")}</p>
        </div>
        <div className="result-dimension-ledger">
          {buildDimensionReport(business).map((item) => (
            <div key={item.dimension}>
              <span><strong>{item.dimension}</strong><small>{item.tier.label}</small></span>
              <i><b style={{ width: `${item.score}%` }} /></i>
              <em>{item.score}</em>
            </div>
          ))}
        </div>
      </section>

      <section className="standalone-top-section">
        <div className="standalone-section-title"><span>02 · TRACK MATCHING</span><h2>最适合你的女性赛道</h2><p>六维能力进入18品类权重矩阵后，得到以下Top3。</p></div>
        <div className="standalone-top-list">
          {business.recommendedCategories.map((category, index) => (
            <article key={category.name}><em>0{index + 1}</em><div><small>{index === 0 ? "首选赛道" : "潜力赛道"}</small><strong>{category.name}</strong><span>{category.gate} · {category.income}</span></div><b>{category.match}%</b></article>
          ))}
        </div>
      </section>

      <StandaloneResultActions type="business" shareFeedback={shareFeedback} setShareFeedback={setShareFeedback} onAccount={() => setView("account")} onRestart={() => setView("business-intro")} />
    </main>
  );
}

function AiStandaloneResult({ aiResult, answers, sessionRecordId, leadInfo, setView }) {
  const ai = aiResult ?? calculateAi(fallbackAnswers(aiQuestions));
  const aiSolution = getAiSolution(ai.weakest);
  const [saveState, setSaveState] = useState("正在保存");
  const [shareFeedback, setShareFeedback] = useState("");
  const savedKey = useRef("");

  useEffect(() => {
    if (!aiResult || !hasLeadInfo(leadInfo)) return;
    const record = buildAssessmentRecord(sessionRecordId, "ai", null, ai, leadInfo);
    const key = `${record.id}:${record.aiScore}`;
    if (savedKey.current === key) return;
    savedKey.current = key;
    saveAssessmentRecord({ assessmentType: "ai", record, ai, aiAnswers: answers })
      .then(() => setSaveState("已保存到我的档案"))
      .catch(() => { savedKey.current = ""; setSaveState("保存失败，请稍后重试"); });
  }, [ai, aiResult, answers, leadInfo, sessionRecordId]);

  const orderedAreas = [...ai.areas].sort((left, right) => ai.percent[right] - ai.percent[left]);
  return (
    <main className="page-shell standalone-result-shell ai-result-shell">
      <section className="standalone-result-hero">
        <div><span className="document-kicker">AI TOOL READINESS RESULT</span><h1>你的AI效率，<br />不该只靠临时发挥。</h1><p>{leadInfo?.name}，你当前的AI综合熟练度为 <strong>{ai.total}分</strong>，优先补齐{ai.weakest}，会最快看到效率变化。</p><small>{saveState}</small></div>
        <div className="standalone-result-score"><span>AI综合熟练度</span><strong>{ai.total}</strong><small>/ 100</small></div>
      </section>
      <section className="ai-result-ledger">
        <div className="standalone-section-title"><span>01 · AI CAPABILITY MAP</span><h2>六项工具能力</h2><p>每一项都来自你的真实答题，不使用模糊标签替代结果。</p></div>
        <div className="ai-result-bars">
          {orderedAreas.map((area, index) => (
            <div className={area === ai.weakest ? "is-priority" : ""} key={area}><em>0{index + 1}</em><span><strong>{area}</strong><small>{area === ai.weakest ? "优先补齐" : area === ai.strongest ? "当前优势" : "继续稳定"}</small></span><i><b style={{ width: `${ai.percent[area]}%` }} /></i><b>{ai.percent[area]}</b></div>
          ))}
        </div>
      </section>
      <section className="ai-action-prescription"><span>02 · SOLUTION</span><h2>{aiSolution.title}</h2><p>{aiSolution.summary}</p><div><strong>本周建议</strong><span>{aiSolution.action}</span></div><button type="button" onClick={() => setView("ai-tools")}>查看{ai.weakest}工具方案 <ArrowRight size={17} /></button></section>
      <StandaloneResultActions type="ai" shareFeedback={shareFeedback} setShareFeedback={setShareFeedback} onAccount={() => setView("account")} onRestart={() => setView("ai-intro")} />
    </main>
  );
}

function StandaloneResultActions({ type, shareFeedback, setShareFeedback, onAccount, onRestart }) {
  return (
    <section className="standalone-result-actions">
      <div><span>YOUR PRIVATE ARCHIVE</span><h2>结果已进入你的私人档案</h2></div>
      <button type="button" onClick={onAccount}>查看我的测评 <UserCircle size={18} /></button>
      <button type="button" onClick={() => shareAssessment(type, setShareFeedback)}><ShareNetwork size={18} />{shareFeedback || "分享这个测评"}</button>
      <button type="button" onClick={onRestart}>重新测评</button>
    </section>
  );
}

function BusinessAssessment({ answers, setAnswers, setView, businessResult, standalone = false }) {
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
    if (selected === undefined) return;
    if (index < commercialQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      setView(standalone ? "business-result" : "ai");
    }
  }

  return (
    <main className="page-shell assessment-shell">
      {standalone ? <StandaloneAssessmentHead type="business" onBack={() => setView("business-intro")} /> : <FlowStepper current="business" completed={businessResult ? ["business"] : []} />}
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
            <button className="primary-btn compact" type="button" onClick={nextQuestion} disabled={selected === undefined}>
              {index === commercialQuestions.length - 1 ? standalone ? "查看商业测评结果" : "进入AI工具测评" : "下一题"} <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <aside className="category-pool">
          <span className="eyebrow">18个女性赛道候选池</span>
          <h2>提交后生成Top3推荐品类</h2>
          <CategoryChips />
          <div className="top-preview">
            {interim.complete ? interim.recommendedCategories.map((category, idx) => (
              <div key={category.name}>
                <span>0{idx + 1}</span>
                <strong>{category.name}</strong>
                <small>{category.match}% · {category.income}</small>
              </div>
            )) : (
              <p className="top-preview-note">已完成 {interim.answeredCount} / {commercialQuestions.length} 题，完整作答后计算赛道匹配。</p>
            )}
          </div>
        </aside>
      </section>
      <DimensionBand scores={interim.percentScores} />
    </main>
  );
}

function AiAssessment({ aiAnswers, setAiAnswers, setView, businessResult, aiResult, standalone = false }) {
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
    if (selected === undefined) return;
    if (index < aiQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      setView(standalone ? "ai-result" : "card");
    }
  }

  return (
    <main className="page-shell assessment-shell">
      {standalone ? <StandaloneAssessmentHead type="ai" onBack={() => setView("ai-intro")} /> : <FlowStepper current="ai" completed={["business"].concat(aiResult ? ["ai"] : [])} />}
      <section className="assessment-layout ai-layout">
        <aside className="side-summary completed">
          <span className="eyebrow">{standalone ? "AI TOOL READINESS" : "商业测评已完成"}</span>
          <h1>{standalone ? "AI工具能力测评" : `${business.level.level} · ${business.level.name}`}</h1>
          <p>{standalone ? "识别六项工具能力成熟度，找到最需要优先补齐的环节。" : `当前Top3品类：${business.recommendedCategories.map((item) => item.short).join(" / ")}`}</p>
          {standalone ? <div className="ai-standalone-seal"><MagicWand size={42} weight="thin" /><span>12题 · 六项能力</span></div> : <RadarChart scores={business.percentScores} compact />}
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
            <button className="primary-btn compact" type="button" onClick={nextQuestion} disabled={selected === undefined}>
              {index === aiQuestions.length - 1 ? standalone ? "查看AI测评结果" : "生成OPC定位卡" : "下一题"} <ArrowRight size={17} />
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
  onAiTools,
  onOpenInsight,
  reportUnlocked,
}) {
  const weakestAreas = [...ai.areas]
    .sort((left, right) => ai.percent[left] - ai.percent[right])
    .slice(0, 3);

  const dimensionState = (item) => {
    if (item.dimension === business.strongestDim) return "核心优势";
    if (item.dimension === business.weakestDim) return "优先补齐";
    return item.score >= 80 ? "优势能力" : item.score >= 72 ? "稳定能力" : "待提升";
  };

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
          <div className="is-score">
            <span>她信分</span>
            <strong>{creditScore(business)}</strong>
            <small>商业潜力综合分</small>
          </div>
          <div className="is-level">
            <span>OPC等级</span>
            <strong>{business.level.level}</strong>
            <small>{business.level.name}</small>
          </div>
        </div>

        <div className="mobile-result-verdict">
          <span>你的核心定位</span>
          <strong>{top[0].name} × {business.strongestDim}</strong>
          <p>先用最擅长的能力进入高匹配赛道，再用AI流程放大稳定产出。</p>
        </div>

        <div className="mobile-report-top3">
          <div className="mobile-report-section-head">
            <span>01</span>
            <h2>推荐赛道 TOP3</h2>
          </div>
          {top.map((category, index) => (
            <div className={`mobile-report-match ${index === 0 ? "is-lead" : ""}`} key={category.name}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <div>
                <small>{index === 0 ? "首选赛道" : "潜力赛道"}</small>
                <strong>{category.name}</strong>
              </div>
              <i
                role="progressbar"
                aria-label={`${category.name}匹配度`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={category.match}
              ><b style={{ width: `${category.match}%` }} /></i>
              <span><b>{category.match}</b>%</span>
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

      {reportUnlocked ? <>
      <section className="mobile-report-band mobile-dimension-ledger">
        <div className="mobile-report-section-head">
          <span>02</span>
          <h2>商业能力六维图谱</h2>
        </div>
        <figure className="mobile-dimension-radar">
          <div>
            <span>能力结构</span>
            <strong>{business.strongestDim}领先</strong>
          </div>
          <RadarChart scores={business.percentScores} mobile />
          <figcaption className="sr-only">
            六维能力分数：
            {dimensions.map((dimension) => `${dimension}${business.percentScores[dimension]}分`).join("，")}。
          </figcaption>
        </figure>
        <div className="mobile-dimension-summary">
          <div><span>最强能力</span><strong>{business.strongestDim}</strong></div>
          <div><span>增长突破口</span><strong>{business.weakestDim}</strong></div>
        </div>
        {dimensionReport.map((item) => (
          <div
            className={`mobile-dimension-row ${item.dimension === business.strongestDim ? "is-strongest" : ""} ${item.dimension === business.weakestDim ? "is-weakest" : ""}`}
            key={item.dimension}
          >
            <div><strong>{item.dimension}</strong><small>{dimensionState(item)}</small></div>
            <i
              role="progressbar"
              aria-label={`${item.dimension}得分`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={item.score}
            ><b style={{ width: `${item.score}%` }} /></i>
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
          <div className={`mobile-ai-row ${index === 0 ? "is-priority" : ""}`} key={area}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <div>
              <small>{index === 0 ? "优先补齐" : index === 1 ? "建立标准动作" : "可快速提升"}</small>
              <strong>{area}</strong>
              <i
                role="progressbar"
                aria-label={`${area}工具成熟度`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={ai.percent[area]}
              ><b style={{ width: `${ai.percent[area]}%` }} /></i>
            </div>
            <span>{ai.percent[area]}<small>/100</small></span>
          </div>
        ))}
      </section>

      <section className="mobile-report-band mobile-route-ledger">
        <div className="mobile-report-section-head">
          <span>04</span>
          <h2>你的30天启动路径</h2>
        </div>
        <div className="mobile-route-timeline">
        {bespokeRoute.map((item, index) => (
          <article className={index === 0 ? "is-current" : ""} key={item.title}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <div><span>{item.period}</span><strong>{item.title}</strong><p>{item.text}</p></div>
          </article>
        ))}
        </div>
      </section>
      </> : (
        <section className="mobile-report-access-gate">
          <span>PRIVATE INTERPRETATION</span>
          <LockKey size={28} weight="thin" />
          <h2>完整商业解读待开放</h2>
          <p>六维能力图、AI解决方案、Top3依据和30天路径将由顾问结合你的状态开放。</p>
          <button type="button" onClick={onOpenInsight}>查看开放方式 <ArrowRight size={17} /></button>
          <small>微信 · Her-AICircle</small>
        </section>
      )}

      <section className="mobile-report-actions">
        <span>TURN POSITIONING INTO ACTION</span>
        <h2>把定位变成第一步</h2>
        <button type="button" onClick={reportUnlocked ? onAiTools : onOpenInsight}>
          {reportUnlocked ? "查看AI工具方案" : "申请开放完整解读"} <ArrowRight size={18} />
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

function ReportAccessDialog({ open, unlocked, checking, business, aiSolution, onClose, onRefresh }) {
  if (!open) return null;
  const report = buildDimensionReport(business);
  return (
    <div className="report-access-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="report-access-dialog" role="dialog" aria-modal="true" aria-labelledby="report-access-title">
        <button className="report-dialog-close" type="button" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        {unlocked ? <>
          <span className="document-kicker">CAPABILITY INTERPRETATION</span>
          <h2 id="report-access-title">六维能力详情</h2>
          <div className="report-dialog-grid">
            <RadarChart scores={business.percentScores} mobile />
            <div className="report-dialog-dimensions">
              {report.map((item) => <div key={item.dimension}><span><strong>{item.dimension}</strong><small>{item.tier.label}</small></span><i><b style={{ width: `${item.score}%` }} /></i><em>{item.score}</em></div>)}
            </div>
          </div>
          <article className="report-dialog-solution"><span>AI解决方案</span><strong>{aiSolution.title}</strong><p>{aiSolution.summary}</p></article>
        </> : <>
          <span className="document-kicker">PRIVATE INTERPRETATION</span>
          <LockKey className="report-lock-icon" size={34} weight="thin" />
          <h2 id="report-access-title">完整能力解读尚未开放</h2>
          <p>顾问会结合你的商业等级、Top3赛道和AI短板开放完整能力图与行动方案。</p>
          <div className="report-contact-card"><span>添加解读顾问微信</span><strong>Her-AICircle</strong><small>备注：OPC定位卡 + 你的姓名</small></div>
          <button className="report-refresh-access" type="button" onClick={onRefresh} disabled={checking}>{checking ? "正在检查权限" : "我已联系，刷新开放状态"}</button>
        </>}
      </section>
    </div>
  );
}

function PositioningCard({ businessResult, aiResult, setView, sessionRecordId, leadInfo, businessAnswers, aiAnswers }) {
  const business = businessResult ?? calculateBusiness(fallbackAnswers(commercialQuestions));
  const ai = aiResult ?? calculateAi(fallbackAnswers(aiQuestions));
  const isDemoReport = !businessResult || !aiResult;
  const [copied, setCopied] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const [reportUnlocked, setReportUnlocked] = useState(isDemoReport);
  const [accessChecking, setAccessChecking] = useState(false);
  const savedRecordKey = useRef("");
  const top = business.recommendedCategories;
  const primaryCategory = top[0];
  const profileName = isDemoReport ? "林然" : leadInfo?.name || "当前访客";
  const profileInitial = profileName.slice(0, 1) || "她";
  const dimensionReport = buildDimensionReport(business);
  const categoryRationales = buildCategoryRationales(business, ai);
  const bespokeRoute = buildBespokeRoute(business, ai);
  const aiSolution = getAiSolution(ai.weakest);
  const growthPlan = getLevelGrowthPlan(business.level.level);
  const recommendedTools = toolsByIds(aiSolution.toolIds);
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
    })
      .then((savedRecord) => setReportUnlocked(Boolean(savedRecord?.reportUnlocked)))
      .catch(() => {
        savedRecordKey.current = "";
      });
  }, [ai, aiAnswers, business, businessAnswers, isDemoReport, leadInfo, sessionRecordId]);

  async function refreshReportAccess() {
    setAccessChecking(true);
    try {
      const records = await fetchUserRecords();
      const record = records.find((item) => item.id === sessionRecordId);
      setReportUnlocked(Boolean(record?.reportUnlocked));
    } finally {
      setAccessChecking(false);
    }
  }

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
    ctx.fillText(`下一步：${growthPlan.objective}${growthPlan.next ? `，目标${growthPlan.next}` : ""}`, 56, 370);
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
        onAiTools={() => setView("ai-tools")}
        onOpenInsight={() => setInsightOpen(true)}
        reportUnlocked={reportUnlocked}
      />
      <section className="card-title-row">
        <div>
          <span className="document-kicker">PERSONAL OPC POSITIONING CARD</span>
          <h2 className="card-page-title">个人OPC定位卡</h2>
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
            <blockquote>{business.level.desc}</blockquote>
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
              <div><span>品类匹配</span><strong>{top[0].short} · {top[0].match}%</strong></div>
              <div><span>下一等级</span><strong>{growthPlan.next || "长期影响力"}</strong></div>
            </div>
          </div>

          <div className="radar-column">
            <h2>六维能力维度</h2>
            {reportUnlocked ? <>
              <RadarChart scores={business.percentScores} />
              <p className="sr-only">六维能力分数：{dimensions.map((dimension) => `${dimension}${business.percentScores[dimension]}分`).join("，")}。</p>
            </> : <div className="radar-locked-preview"><LockKey size={30} weight="thin" /><strong>完整能力图待开放</strong><span>顾问解读后可查看六维分数</span></div>}
            <button className="ghost-btn compact-ghost" type="button" onClick={() => setInsightOpen(true)}>
              {reportUnlocked ? "查看能力详情" : "申请开放详情"} <ArrowRight size={16} />
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
            {reportUnlocked ? <div className="mini-insights">
              <InsightCard title="卡在哪里" text={`内容能做出来，但${ai.weakest}还没有形成可复用流程。`} />
              <InsightCard title="价值所在" text={`${business.strongestDim}突出，适合先从${top[0].name}跑通首单。`} />
            </div> : <p className="top3-locked-note"><LockKey size={15} /> 推荐依据和短板分析待开放</p>}
          </div>

          {reportUnlocked ? <div className="ai-tool-row">
            <div>
              <span>AI工具短板</span>
              <strong>{ai.weakest}</strong>
              <small>解决方案 · {aiSolution.title}</small>
            </div>
            <div>
              <span>AI工具推荐</span>
              <strong>{recommendedTools.map((tool) => tool.name).join(" · ")}</strong>
              <button type="button" onClick={() => setView("ai-tools")}>查看官方入口 <ArrowRight size={14} /></button>
            </div>
          </div> : <button className="ai-tool-locked-row" type="button" onClick={() => setInsightOpen(true)}><LockKey size={20} /><span><strong>AI解决方案待开放</strong><small>根据{ai.weakest}生成专属工具组合</small></span><ArrowRight size={17} /></button>}
        </section>

        <aside className="action-column">
          {reportUnlocked ? <article className="path-card">
            <h2>下一步行动路径</h2>
            <div className="path-icons">
              {growthPlan.steps.map((item) => <span key={item}>{item}</span>)}
            </div>
            <p>{growthPlan.objective}{growthPlan.next ? `，完成后向${growthPlan.next}升级。` : "。"}</p>
          </article> : <article className="path-card path-card-locked"><LockKey size={26} weight="thin" /><h2>成长路径待开放</h2><p>当前等级为{business.level.level}，开放后将显示与你等级对应的下一阶段目标。</p><button type="button" onClick={() => setInsightOpen(true)}>查看开放方式</button></article>}
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
          <button className="action-tile" type="button" onClick={() => setView("ai-tools")}>
            <Target size={34} weight="duotone" />
            <strong>AI工具方案</strong>
            <span>按短板查看官方入口</span>
          </button>
        </aside>
      </section>

      {reportUnlocked ? <>
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
            <p>每个女性赛道都有独立的六维权重；系统将你的六维百分比分别乘以赛道权重，除以该赛道权重总和后排序。</p>
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
      </> : (
        <section className="desktop-report-access-gate">
          <div><span className="document-kicker">PRIVATE INTERPRETATION</span><h2>你的基础定位已经生成</h2><p>完整六维能力、AI解决方案、Top3计算依据与30天成长路径将在顾问开放后显示。</p></div>
          <button type="button" onClick={() => setInsightOpen(true)}><LockKey size={20} />申请开放完整解读 <ArrowRight size={17} /></button>
          <small>微信 · Her-AICircle</small>
        </section>
      )}
      <ReportAccessDialog
        open={insightOpen}
        unlocked={reportUnlocked}
        checking={accessChecking}
        business={business}
        aiSolution={aiSolution}
        onClose={() => setInsightOpen(false)}
        onRefresh={refreshReportAccess}
      />
    </main>
  );
}

function AdminLogin({ setView, onAuthenticated }) {
  const [form, setForm] = useState({ account: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const account = form.account.trim();
    setSubmitting(true);
    setError("");
    try {
      const admin = await loginAdmin(account, form.password);
      onAuthenticated(admin);
      setView("admin");
    } catch (requestError) {
      setError(requestError.message || "账号或密码不正确。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell admin-shell admin-login-shell" style={{ "--admin-wave-bg": `url(${fruitWineWave})` }}>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="document-kicker">ADMIN ACCESS</span>
        <h1 id="admin-login-title">管理工作台</h1>
        <p>超级管理员查看全量数据并分配顾问；顾问仅查看分配给自己的用户。</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>管理员账号</span>
            <input
              autoComplete="username"
              value={form.account}
              onChange={(event) => setForm({ ...form, account: event.target.value })}
              placeholder="管理员或顾问账号"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              autoComplete="current-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="请输入密码"
            />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "正在验证" : "进入管理后台"} <ShieldCheck size={18} />
          </button>
        </form>
        <div className="admin-demo-note"><ShieldCheck size={17} /><span>安全会话将在30天后自动失效</span></div>
      </section>
    </main>
  );
}

function AdminDashboard({ adminUser, setAdminUser, setView }) {
  const adminLoggedIn = Boolean(adminUser);
  const isSuperAdmin = adminUser?.role === "superadmin";
  const [records, setRecords] = useState(() => readAdminRecords());
  const [users, setUsers] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [advisorForm, setAdvisorForm] = useState({ name: "", account: "", password: "" });
  const [advisorState, setAdvisorState] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [ownerFilter, setOwnerFilter] = useState("全部顾问");
  const [activeMetric, setActiveMetric] = useState("all");
  const [intentPage, setIntentPage] = useState(1);
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
        const [remoteRecords, remoteUsers, remoteAdvisors] = await Promise.all([
          fetchAdminRecords(),
          fetchAdminUsers(),
          isSuperAdmin ? fetchAdvisors() : Promise.resolve([]),
        ]);
        if (!active) return;
        const nextRecords = remoteRecords.length ? remoteRecords : readAdminRecords();
        setRecords(nextRecords);
        setUsers(remoteUsers);
        setAdvisors(remoteAdvisors);
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
  }, [adminLoggedIn, isSuperAdmin]);

  const legacyOwners = [...new Set(records.map((record) => record.owner).filter((owner) => owner && owner !== "未分配"))];
  const ownerOptions = isSuperAdmin
    ? [...new Set(["未分配", ...advisors.filter((advisor) => advisor.active).map((advisor) => advisor.name), ...legacyOwners])]
    : [adminUser?.name].filter(Boolean);

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return records.filter((record) => {
      const metricMatch = activeMetric === "all"
        || (activeMetric === "intent" && highIntentSignals(record).length > 0)
        || (activeMetric === "pending" && ["待跟进", "待分配"].includes(record.status))
        || (activeMetric === "converted" && record.status === "已转化");
      const statusMatch = statusFilter === "全部" || record.status === statusFilter;
      const ownerMatch = ownerFilter === "全部顾问" || record.owner === ownerFilter;
      const userMatch = !selectedUserId || users.find((user) => user.id === selectedUserId)?.recordIds.includes(record.id);
      const keywordMatch = !keyword || [
        record.name,
        record.phone,
        record.id,
        record.category,
        record.level,
        record.aiWeakness,
        record.owner,
      ].some((value) => String(value).toLowerCase().includes(keyword));
      return metricMatch && statusMatch && ownerMatch && userMatch && keywordMatch;
    });
  }, [activeMetric, ownerFilter, query, records, selectedUserId, statusFilter, users]);

  const selectedRecord = filteredRecords.find((record) => record.id === selectedId) ?? filteredRecords[0] ?? records[0];
  const selectedUser = users.find((user) => user.id === selectedUserId)
    ?? users.find((user) => user.recordIds.includes(selectedRecord?.id));

  useEffect(() => {
    setIntentPage(1);
  }, [activeMetric, ownerFilter, query, statusFilter]);

  const selectedBusiness = selectedRecord?.businessResult ?? null;
  const selectedAi = selectedRecord?.aiResult ?? null;
  const selectedDimensions = selectedBusiness ? buildDimensionReport(selectedBusiness) : [];
  const selectedCategories = selectedBusiness?.recommendedCategories ?? [];
  const selectedAiAreas = selectedAi?.areas
    ? [...selectedAi.areas].sort((left, right) => selectedAi.percent[left] - selectedAi.percent[right])
    : [];
  const selectedRoute = selectedBusiness && selectedAi ? buildBespokeRoute(selectedBusiness, selectedAi) : [];
  const pendingCount = records.filter((record) => ["待跟进", "待分配"].includes(record.status)).length;
  const highIntentRecords = records.filter((record) => highIntentSignals(record).length > 0);
  const highIntentCount = highIntentRecords.length;
  const highIntentCriteriaCounts = {
    credit: highIntentRecords.filter((record) => Number(record.credit) >= 800).length,
    level: highIntentRecords.filter((record) => ["L7", "L8", "L9"].includes(record.level)).length,
    match: highIntentRecords.filter((record) => Number(record.match) >= 80).length,
  };
  const focusRecords = [...highIntentRecords]
    .filter((record) => !["已转化", "已归档"].includes(record.status))
    .sort((left, right) => highIntentPriority(right) - highIntentPriority(left))
    .slice(0, 3);
  const intentPageCount = Math.max(1, Math.ceil(filteredRecords.length / 6));
  const effectiveIntentPage = Math.min(intentPage, intentPageCount);
  const visibleIntentRecords = filteredRecords.slice((effectiveIntentPage - 1) * 6, effectiveIntentPage * 6);
  const convertedCount = records.filter((record) => record.status === "已转化").length;

  function selectMetric(metric) {
    setActiveMetric(metric);
    setStatusFilter("全部");
    setOwnerFilter("全部顾问");
    setQuery("");
    setSelectedUserId("");
  }

  function openUserDossier(user) {
    setSelectedUserId(user.id);
    setSelectedId(user.recordIds[0] || "");
    setActiveMetric("all");
    setStatusFilter("全部");
    setQuery("");
  }

  function openRecordDetail(id) {
    setSelectedId(id);
    setActiveMetric("all");
    setStatusFilter("全部");
    setOwnerFilter("全部顾问");
  }

  function exportVisibleRecords() {
    const headings = ["姓名", "手机号", "她信分", "OPC等级", "Top1匹配度", "命中依据", "状态", "顾问", "最近测评"];
    const rows = filteredRecords.map((record) => [
      record.name,
      record.phone,
      record.credit ?? "",
      record.level || "",
      record.match ?? "",
      highIntentSignals(record).map((item) => item.label).join(" / "),
      record.status,
      record.owner,
      formatAdminRecordTime(record.createdAt),
    ]);
    const csv = [headings, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `她智汇-高意向用户-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
      if (Object.prototype.hasOwnProperty.call(patch, "reportUnlocked")) {
        setUsers(await fetchAdminUsers());
      }
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

  async function handleCreateAdvisor(event) {
    event.preventDefault();
    setAdvisorState("正在创建");
    try {
      const advisor = await createAdvisor(advisorForm);
      setAdvisors((current) => [...current, advisor]);
      setAdvisorForm({ name: "", account: "", password: "" });
      setAdvisorState("顾问账号已创建");
    } catch (error) {
      setAdvisorState(error.message || "创建失败");
    }
  }

  async function toggleAdvisor(advisor) {
    try {
      const updated = await setAdvisorActive(advisor.id, !advisor.active);
      setAdvisors((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAdvisorState(updated.active ? "顾问账号已启用" : "顾问账号已停用");
    } catch (error) {
      setAdvisorState(error.message || "更新失败");
    }
  }

  async function logout() {
    try {
      await logoutAdmin();
    } finally {
      setAdminUser(null);
      setView("home");
    }
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
        <div className="admin-head-copy">
          <span className="document-kicker">OPC ADMIN CONSOLE</span>
          <h1>用户测评管理</h1>
          <p>{loading ? "正在同步最新测评记录..." : `${adminUser?.name} · ${isSuperAdmin ? "超级管理员可查看并分配全量用户" : "顾问仅显示分配给你的用户"}`}</p>
          {remoteError && <p className="admin-sync-note" role="status">{remoteError}</p>}
        </div>
        <div className="admin-head-actions">
          <span className={`admin-live-state${remoteError ? " is-offline" : ""}`}>
            <i aria-hidden="true" />
            {loading ? "正在同步数据" : remoteError ? "当前显示本地缓存" : "数据档案已连接"}
          </span>
          <button className="ghost-btn" type="button" onClick={logout}>
            <SignOut size={18} /> 退出
          </button>
        </div>
      </section>

      <section className="admin-stat-grid" aria-label="后台关键指标">
        <AdminStat active={activeMetric === "all"} icon={UsersThree} label="注册用户" onClick={() => selectMetric("all")} value={users.length} />
        <AdminStat active={activeMetric === "intent"} icon={ChartLineUp} label="高意向用户" onClick={() => selectMetric("intent")} value={highIntentCount} />
        <AdminStat active={activeMetric === "pending"} icon={FunnelSimple} label="待处理" onClick={() => selectMetric("pending")} value={pendingCount} />
        <AdminStat active={activeMetric === "converted"} icon={CheckCircle} label="已转化" onClick={() => selectMetric("converted")} value={convertedCount} />
      </section>

      {isSuperAdmin && <section className="admin-advisor-manager" aria-labelledby="advisor-manager-title">
        <div className="admin-advisor-heading"><span>TEAM ACCESS</span><h2 id="advisor-manager-title">顾问账号与数据权限</h2><p>顾问登录后只看到分配给自己的用户。</p></div>
        <form onSubmit={handleCreateAdvisor}>
          <label><span>顾问姓名</span><input value={advisorForm.name} onChange={(event) => setAdvisorForm({ ...advisorForm, name: event.target.value })} placeholder="例如：Mia" required /></label>
          <label><span>登录账号</span><input value={advisorForm.account} onChange={(event) => setAdvisorForm({ ...advisorForm, account: event.target.value })} placeholder="英文或数字" required /></label>
          <label><span>初始密码</span><input type="password" minLength={8} value={advisorForm.password} onChange={(event) => setAdvisorForm({ ...advisorForm, password: event.target.value })} placeholder="至少8位" required /></label>
          <button type="submit">创建顾问 <ArrowRight size={16} /></button>
        </form>
        <div className="admin-advisor-list">
          {advisors.map((advisor) => <article className={advisor.active ? "" : "is-disabled"} key={advisor.id}><div><strong>{advisor.name}</strong><span>{advisor.account}</span></div><small>{records.filter((record) => record.owner === advisor.name).length}条记录</small><button type="button" onClick={() => toggleAdvisor(advisor)}>{advisor.active ? "停用" : "启用"}</button></article>)}
          {!advisors.length && <p>还没有顾问账号。</p>}
        </div>
        {advisorState && <small className="admin-advisor-state" role="status">{advisorState}</small>}
      </section>}

      {activeMetric === "all" && <section className="admin-user-directory" aria-labelledby="admin-user-directory-title">
        <div className="admin-user-directory-head"><div><span>MEMBER DIRECTORY</span><h2 id="admin-user-directory-title">用户总档案</h2></div><button className={!selectedUserId ? "active" : ""} type="button" onClick={() => setSelectedUserId("")}>查看全部记录</button></div>
        <div className="admin-user-directory-grid">
          {users.map((user) => <button className={selectedUserId === user.id ? "active" : ""} type="button" onClick={() => openUserDossier(user)} key={user.id}><span>{user.name.slice(0, 1)}</span><div><strong>{user.name}</strong><small>{user.phone}</small></div><em>{user.assessmentCount}次测评</em><i>{user.completedTypes.map((type) => assessmentMeta[type]?.shortTitle).filter(Boolean).join(" · ") || "尚未测评"}</i></button>)}
        </div>
      </section>}

      {activeMetric === "intent" && (
        <section className="admin-intent-view" aria-labelledby="intent-view-title">
          <div className="admin-intent-summary">
            <div className="admin-intent-summary-heading">
              <span>INTENT PROFILE</span>
              <h2 id="intent-view-title">高意向用户画像</h2>
            </div>
            <div className="admin-intent-criterion">
              <strong>{highIntentCriteriaCounts.credit}</strong>
              <span>她信分 ≥ 800</span>
            </div>
            <div className="admin-intent-criterion">
              <strong>{highIntentCriteriaCounts.level}</strong>
              <span>OPC等级 L7-L9</span>
            </div>
            <div className="admin-intent-criterion">
              <strong>{highIntentCriteriaCounts.match}</strong>
              <span>Top3匹配度 ≥ 80%</span>
            </div>
            <p>满足任一条件 · 实时更新</p>
          </div>

          <div className="admin-intent-layout">
            <div className="admin-intent-records">
              <div className="admin-intent-heading">
                <div>
                  <span>PRIORITY USERS</span>
                  <h2>{highIntentCount}位高意向用户</h2>
                </div>
                <p>{filteredRecords.length} / {highIntentCount} 条记录</p>
              </div>

              <div className="admin-intent-toolbar">
                <label className="admin-search">
                  <MagnifyingGlass size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索姓名、手机号、命中依据"
                    aria-label="搜索高意向用户"
                  />
                </label>
                <div className="admin-intent-segments" aria-label="按跟进状态筛选">
                  {[
                    { value: "全部", label: "全部" },
                    { value: "待分配", label: "待分配" },
                    { value: "待跟进", label: "待跟进" },
                    { value: "已联系", label: "跟进中" },
                  ].map((item) => (
                    <button
                      className={statusFilter === item.value ? "active" : ""}
                      type="button"
                      key={item.value}
                      onClick={() => setStatusFilter(item.value)}
                      aria-pressed={statusFilter === item.value}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <label className="admin-intent-owner-filter">
                  <span className="sr-only">按顾问筛选</span>
                  <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} aria-label="按顾问筛选">
                    <option>全部顾问</option>
                    {ownerOptions.map((owner) => <option key={owner}>{owner}</option>)}
                  </select>
                </label>
                <button className="admin-export-btn" type="button" onClick={exportVisibleRecords} title="导出当前名单">
                  <DownloadSimple size={17} />
                  <span>导出</span>
                </button>
              </div>

              <div className="admin-intent-table-wrap">
                <table className="admin-intent-table">
                  <thead>
                    <tr>
                      <th>用户</th>
                      <th>综合表现</th>
                      <th>命中依据</th>
                      <th>当前状态</th>
                      <th>顾问</th>
                      <th>最近测评</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleIntentRecords.map((record) => (
                      <tr key={record.id}>
                        <td data-label="用户">
                          <strong>{record.name}</strong>
                          <span>{record.phone}</span>
                        </td>
                        <td data-label="综合表现">
                          <strong>{record.credit != null ? `她信分 ${record.credit}` : record.aiScore != null ? `AI ${record.aiScore}` : "—"}</strong>
                          <span>{record.level ? `OPC ${record.level}` : assessmentMeta[record.assessmentType]?.shortTitle}</span>
                        </td>
                        <td data-label="命中依据">
                          <div className="admin-intent-signals">
                            {highIntentSignals(record).map((signal) => <span key={signal.key}>{signal.label}</span>)}
                          </div>
                        </td>
                        <td data-label="当前状态">
                          <select value={record.status} onChange={(event) => persistRecord(record.id, { status: event.target.value })} aria-label={`${record.name}状态`}>
                            {adminStatuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </td>
                        <td data-label="顾问">
                          <select value={record.owner} disabled={!isSuperAdmin} onChange={(event) => persistRecord(record.id, { owner: event.target.value })} aria-label={`${record.name}顾问`}>
                            {ownerOptions.map((owner) => <option key={owner}>{owner}</option>)}
                          </select>
                        </td>
                        <td data-label="最近测评"><span>{formatAdminRecordTime(record.createdAt)}</span></td>
                        <td data-label="操作">
                          <div className="admin-row-actions">
                            <button type="button" onClick={() => openRecordDetail(record.id)} aria-label={`查看${record.name}完整档案`} title="查看完整档案">
                              <Eye size={16} />
                            </button>
                            <button type="button" onClick={() => persistRecord(record.id, { status: "已联系" })} aria-label={`跟进${record.name}`} title="标记跟进中">
                              <PencilSimple size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredRecords.length && <p className="admin-empty">没有符合当前条件的高意向用户。</p>}
              </div>
              {filteredRecords.length > 0 && (
                <nav className="admin-intent-pagination" aria-label="高意向用户分页">
                  <button type="button" onClick={() => setIntentPage((page) => Math.max(1, page - 1))} disabled={effectiveIntentPage === 1}>
                    上一页
                  </button>
                  <span>{effectiveIntentPage} / {intentPageCount}</span>
                  <button type="button" onClick={() => setIntentPage((page) => Math.min(intentPageCount, page + 1))} disabled={effectiveIntentPage === intentPageCount}>
                    下一页
                  </button>
                </nav>
              )}
            </div>

            <aside className="admin-intent-focus" aria-label="本周跟进焦点">
              <div className="admin-intent-focus-title">
                <span>WEEKLY FOCUS</span>
                <h2>本周跟进焦点</h2>
              </div>
              <div className="admin-intent-focus-list">
                {focusRecords.map((record, index) => (
                  <article key={record.id}>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    <div>
                      <div className="admin-intent-focus-name">
                        <strong>{record.name}</strong>
                        {record.level && <span>OPC {record.level}</span>}
                      </div>
                      <p>命中依据：{highIntentSignals(record).map((item) => item.label).join(" / ")}</p>
                      <small>偏好：{record.category || "待补充品类"} · AI短板：{record.aiWeakness || "待测"}</small>
                      <button type="button" onClick={() => openRecordDetail(record.id)}>查看并跟进 <ArrowRight size={14} /></button>
                    </div>
                  </article>
                ))}
              </div>
              <button className="admin-intent-all-btn" type="button" onClick={() => { setStatusFilter("全部"); setOwnerFilter("全部顾问"); }}>
                查看全部高意向用户 <ArrowRight size={15} />
              </button>
            </aside>
          </div>
        </section>
      )}

      {activeMetric !== "intent" && <section className="admin-workbench">
        <div className="admin-records-panel">
          <div className="admin-panel-heading">
            <div>
              <span>USER ARCHIVE</span>
              <h2>{adminMetricFilters[activeMetric].label}</h2>
            </div>
            <p>{filteredRecords.length} 条记录</p>
          </div>
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
                      <button
                        className="admin-user-cell"
                        type="button"
                        onClick={() => setSelectedId(record.id)}
                        aria-pressed={record.id === selectedRecord?.id}
                      >
                        <strong>{record.name}</strong>
                        <span>{record.phone}</span>
                      </button>
                    </td>
                    <td><strong>{record.level || (record.assessmentType === "ai" ? "AI" : "—")}</strong><span>{record.credit ?? record.aiScore ?? "—"}</span></td>
                    <td>{record.category || "—"}{record.match != null && <small>{record.match}%</small>}</td>
                    <td>{record.aiWeakness || "—"}</td>
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
                        disabled={!isSuperAdmin}
                        onChange={(event) => persistRecord(record.id, { owner: event.target.value })}
                        aria-label={`${record.name}顾问`}
                      >
                        {ownerOptions.map((owner) => <option key={owner}>{owner}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => setSelectedId(record.id)} aria-label={`查看${record.name}`}>
                          <Eye size={16} />
                        </button>
                        {isSuperAdmin && <button type="button" onClick={() => deleteRecord(record.id)} aria-label={`删除${record.name}`}>
                          <Trash size={16} />
                        </button>}
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
            <div className="admin-detail-label">
              <span>PRIVATE DOSSIER</span>
              <small>完整测评档案</small>
            </div>
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
            {selectedUser && <section className="admin-user-aggregate" aria-label="用户汇总信息">
              <div><span>注册时间</span><strong>{formatAdminRecordTime(selectedUser.createdAt)}</strong></div>
              <div><span>累计测评</span><strong>{selectedUser.assessmentCount} 次</strong></div>
              <div><span>完成项目</span><strong>{selectedUser.completedTypes.map((type) => assessmentMeta[type]?.shortTitle).filter(Boolean).join(" / ") || "尚未测评"}</strong></div>
              <div><span>已开放报告</span><strong>{selectedUser.unlockedCount} 份</strong></div>
              <nav aria-label="该用户的测评记录">{selectedUser.recordIds.map((recordId, index) => <button className={selectedRecord.id === recordId ? "active" : ""} type="button" onClick={() => setSelectedId(recordId)} key={recordId}>记录 {index + 1}</button>)}</nav>
            </section>}
            <div className="admin-detail-metrics">
              <Metric label="测评类型" value={assessmentMeta[selectedRecord.assessmentType]?.shortTitle || "OPC定位"} />
              <Metric label="核心得分" value={selectedRecord.businessScore != null ? `${selectedRecord.businessScore}分` : `${selectedRecord.aiScore ?? "—"}分`} />
              <Metric label="OPC等级" value={selectedRecord.level ? `${selectedRecord.level} ${selectedRecord.levelName}` : "单项测评"} />
            </div>
            <div className="admin-detail-list">
              <div><span>推荐品类</span><strong>{selectedRecord.category ? `${selectedRecord.category} · ${selectedRecord.match}%` : "本次未测"}</strong></div>
              <div><span>AI工具短板</span><strong>{selectedRecord.aiWeakness || "本次未测"}</strong></div>
              <div><span>来源</span><strong>{selectedRecord.source}</strong></div>
              <div><span>负责顾问</span><strong>{selectedRecord.owner}</strong></div>
              <div><span>完整报告</span><strong>{selectedRecord.reportUnlocked ? `已开放 · ${selectedRecord.unlockedBy || "管理员"}` : "尚未开放"}</strong></div>
            </div>

            {selectedBusiness || selectedAi ? (
              <div className="admin-full-results">
                {selectedBusiness && <section className="admin-result-section">
                  <div className="admin-result-title">
                    <span>01</span>
                    <div><small>BUSINESS PROFILE</small><h3>商业能力详细结果</h3></div>
                  </div>
                  <div className="admin-capability-chart">
                    <RadarChart scores={selectedBusiness.percentScores} mobile />
                    <div className="admin-dimension-bars">
                      {selectedDimensions.map((item) => (
                        <div key={item.dimension}>
                          <span><strong>{item.dimension}</strong><small>{item.tier.label}</small></span>
                          <i aria-hidden="true"><b style={{ width: `${item.score}%` }} /></i>
                          <em>{item.score}</em>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>}

                {selectedBusiness && <section className="admin-result-section">
                  <div className="admin-result-title">
                    <span>02</span>
                    <div><small>TRACK MATCHING</small><h3>推荐赛道 Top3</h3></div>
                  </div>
                  <div className="admin-category-results">
                    {selectedCategories.map((category, index) => (
                      <div key={category.name}>
                        <em>{String(index + 1).padStart(2, "0")}</em>
                        <strong>{category.name}</strong>
                        <i aria-hidden="true"><b style={{ width: `${category.match}%` }} /></i>
                        <span>{category.match}%</span>
                      </div>
                    ))}
                  </div>
                </section>}

                {selectedAi && <section className="admin-result-section admin-ai-results">
                  <div className="admin-result-title">
                    <span>03</span>
                    <div><small>AI CAPABILITY</small><h3>AI工具能力与短板</h3></div>
                  </div>
                  {selectedAiAreas.map((area, index) => (
                    <div className={index === 0 ? "is-priority" : ""} key={area}>
                      <span><strong>{area}</strong><small>{index === 0 ? "优先补齐" : "工具成熟度"}</small></span>
                      <i aria-hidden="true"><b style={{ width: `${selectedAi.percent[area]}%` }} /></i>
                      <em>{selectedAi.percent[area]}</em>
                    </div>
                  ))}
                </section>}

                {selectedRoute.length > 0 && <section className="admin-result-section">
                  <div className="admin-result-title">
                    <span>04</span>
                    <div><small>ACTION ROUTE</small><h3>30天启动路径</h3></div>
                  </div>
                  <div className="admin-route-results">
                    {selectedRoute.map((item, index) => (
                      <article key={item.title}>
                        <em>{String(index + 1).padStart(2, "0")}</em>
                        <div><span>{item.period}</span><strong>{item.title}</strong><p>{item.text}</p></div>
                      </article>
                    ))}
                  </div>
                </section>}

                <section className="admin-answer-results">
                  <div className="admin-result-title">
                    <span>05</span>
                    <div><small>ANSWER SHEET</small><h3>原始答题记录</h3></div>
                  </div>
                  <details>
                    <summary>商业测评 · {selectedRecord.businessAnswers?.length ?? 0}题</summary>
                    <div>
                      {commercialQuestions.map((question, index) => (
                        <article key={`${question.q}-${index}`}>
                          <span>{String(index + 1).padStart(2, "0")} · {question.q}</span>
                          <strong>{question.options[selectedRecord.businessAnswers?.[index]] ?? "未记录"}</strong>
                        </article>
                      ))}
                    </div>
                  </details>
                  <details>
                    <summary>AI工具测评 · {selectedRecord.aiAnswers?.length ?? 0}题</summary>
                    <div>
                      {aiQuestions.map((question, index) => (
                        <article key={`${question.q}-${index}`}>
                          <span>{String(index + 1).padStart(2, "0")} · {question.q}</span>
                          <strong>{question.options[selectedRecord.aiAnswers?.[index]] ?? "未记录"}</strong>
                        </article>
                      ))}
                    </div>
                  </details>
                </section>
              </div>
            ) : (
              <p className="admin-detail-unavailable">这条历史演示记录只保存了结果摘要，新的真实测评记录会展示完整维度、AI能力与答题明细。</p>
            )}

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
              <button type="button" className={selectedRecord.reportUnlocked ? "ghost-btn" : "primary-btn compact"} onClick={() => persistRecord(selectedRecord.id, { reportUnlocked: !selectedRecord.reportUnlocked })}>
                {selectedRecord.reportUnlocked ? "收回完整报告" : "开放完整报告"}
              </button>
              <button type="button" className="primary-btn compact" onClick={() => persistRecord(selectedRecord.id, { status: "已联系" })}>
                标记已联系
              </button>
              <button type="button" className="ghost-btn" onClick={() => persistRecord(selectedRecord.id, { status: "已转化" })}>
                标记已转化
              </button>
            </div>
          </aside>
        )}
      </section>}
    </main>
  );
}

function AdminStat({ active, icon: Icon, label, onClick, value }) {
  return (
    <button
      className={`admin-stat-card${active ? " active" : ""}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} ${value}`}
    >
      <span><Icon size={24} weight="duotone" /></span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </button>
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
  return calculateCreditScore(business);
}

function RadarChart({ scores, compact = false, mobile = false }) {
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
    const radius = compact ? 62 : mobile ? 90 : 105;
    const values = dimensions.map((dim) => scores[dim] ?? 0);
    const angleStep = (Math.PI * 2) / dimensions.length;
    const mobileLabels = {
      "内容能力": "内容",
      "销售敏感度": "销售",
      "AI工具熟练度": "AI工具",
      "学习能力": "学习",
      "社交影响力": "影响力",
      "商业判断力": "商业判断",
    };

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
        const labelRadius = radius + (mobile ? 24 : 28);
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;
        ctx.textAlign = x < center - 8 ? "right" : x > center + 8 ? "left" : "center";
        ctx.fillText(mobile ? mobileLabels[dim] : dim, x, y);
      });
    }
  }, [scores, compact, mobile]);

  return <canvas className="radar-canvas" ref={canvasRef} role="img" aria-label="六维能力雷达图" />;
}

export function App() {
  const [view, setViewState] = useState(() => (
    typeof window === "undefined" ? "home" : viewFromPath(window.location.pathname)
  ));
  const [answers, setAnswers] = useState([]);
  const [aiAnswers, setAiAnswers] = useState([]);
  const [sessionRecordId, setSessionRecordId] = useState(() => `OPC-${Date.now().toString(36).toUpperCase()}`);
  const [leadInfo, setLeadInfo] = useState(() => readStoredLeadInfo());
  const [assessmentMode, setAssessmentMode] = useState(() => {
    if (typeof window === "undefined") return "opc";
    if (window.location.pathname.includes("/assessments/business")) return "business";
    if (window.location.pathname.includes("/assessments/ai")) return "ai";
    return "opc";
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const adminLoggedIn = Boolean(adminUser);

  const businessResult = useMemo(() => (
    isAssessmentComplete(answers, commercialQuestions) ? calculateBusiness(answers) : null
  ), [answers]);
  const aiResult = useMemo(() => (
    isAssessmentComplete(aiAnswers, aiQuestions) ? calculateAi(aiAnswers) : null
  ), [aiAnswers]);

  function navigate(nextView, { replace = false } = {}) {
    const path = viewPaths[nextView] || "/";
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history[replace ? "replaceState" : "pushState"]({ view: nextView }, "", path);
    }
    setViewState(nextView);
  }

  useEffect(() => {
    function handlePopState(event) {
      const historyView = event.state?.view;
      setViewState(viewPaths[historyView] ? historyView : viewFromPath(window.location.pathname));
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let active = true;
    fetchCurrentAdmin()
      .then((admin) => { if (active) setAdminUser(admin); })
      .catch(() => { if (active) setAdminUser(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        setCurrentUser(user);
        if (user) {
          const info = { name: user.name, phone: user.phone };
          setLeadInfo(info);
          writeStoredLeadInfo(info);
        }
      })
      .catch(() => { if (active) setCurrentUser(null); })
      .finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authReady || currentUser) return;
    if (!["business", "ai", "business-result", "ai-result", "account"].includes(view)) return;
    const pendingType = view.startsWith("business") ? "business" : view.startsWith("ai") ? "ai" : "";
    if (pendingType) window.sessionStorage.setItem(PENDING_ASSESSMENT_KEY, pendingType);
    navigate("login", { replace: true });
  }, [authReady, currentUser, view]);

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

  function startAssessmentWithUser(type, user = currentUser) {
    const info = { name: user.name, phone: user.phone };
    setLeadInfo(info);
    writeStoredLeadInfo(info);
    setAnswers([]);
    setAiAnswers([]);
    setAssessmentMode(type);
    setSessionRecordId(`${type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`);
    navigate(type === "ai" ? "ai" : "business");
  }

  function startAssessment(type = "opc") {
    if (!currentUser) {
      window.sessionStorage.setItem(PENDING_ASSESSMENT_KEY, type);
      navigate("login");
      return;
    }
    startAssessmentWithUser(type);
  }

  function navigateView(nextView) {
    if (nextView === "business" && !currentUser) {
      window.sessionStorage.setItem(PENDING_ASSESSMENT_KEY, assessmentMode === "opc" ? "opc" : "business");
      navigate("login");
      return;
    }
    if (nextView === "ai" && !currentUser) {
      window.sessionStorage.setItem(PENDING_ASSESSMENT_KEY, assessmentMode === "opc" ? "opc" : "ai");
      navigate("login");
      return;
    }
    navigate(nextView);
  }

  function handleAuthenticated(user) {
    setCurrentUser(user);
    const info = { name: user.name, phone: user.phone };
    setLeadInfo(info);
    writeStoredLeadInfo(info);
    const pendingType = window.sessionStorage.getItem(PENDING_ASSESSMENT_KEY);
    window.sessionStorage.removeItem(PENDING_ASSESSMENT_KEY);
    if (pendingType && assessmentMeta[pendingType]) {
      startAssessmentWithUser(pendingType, user);
    } else {
      navigate("account");
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      setCurrentUser(null);
      setLeadInfo(null);
      navigate("home");
    }
  }

  return (
    <>
      <AppHeader view={view} onNavigate={navigateView} adminLoggedIn={adminLoggedIn} currentUser={currentUser} />
      {view === "home" && <HomePage setView={navigateView} onStart={() => startAssessment("opc")} businessResult={businessResult} />}
      {view === "business-intro" && <AssessmentEntry type="business" onStart={startAssessment} onNavigate={navigateView} />}
      {view === "ai-intro" && <AssessmentEntry type="ai" onStart={startAssessment} onNavigate={navigateView} />}
      {view === "opc-intro" && <AssessmentEntry type="opc" onStart={startAssessment} onNavigate={navigateView} />}
      {view === "business" && (
        <BusinessAssessment answers={answers} setAnswers={setAnswers} setView={navigateView} businessResult={businessResult} standalone={assessmentMode === "business"} />
      )}
      {view === "ai" && (
        <AiAssessment aiAnswers={aiAnswers} setAiAnswers={setAiAnswers} setView={navigateView} businessResult={businessResult} aiResult={aiResult} standalone={assessmentMode === "ai"} />
      )}
      {view === "business-result" && <BusinessStandaloneResult businessResult={businessResult} answers={answers} sessionRecordId={sessionRecordId} leadInfo={leadInfo} setView={navigateView} />}
      {view === "ai-result" && <AiStandaloneResult aiResult={aiResult} answers={aiAnswers} sessionRecordId={sessionRecordId} leadInfo={leadInfo} setView={navigateView} />}
      {view === "ai-tools" && <AiToolsPage onNavigate={navigateView} />}
      {view === "card" && (
        <PositioningCard
          businessResult={businessResult}
          aiResult={aiResult}
          setView={navigateView}
          sessionRecordId={sessionRecordId}
          leadInfo={leadInfo}
          businessAnswers={answers}
          aiAnswers={aiAnswers}
        />
      )}
      {view === "login" && <UserAuthPage onAuthenticated={handleAuthenticated} onNavigate={navigateView} />}
      {view === "account" && currentUser && <UserAccountPage currentUser={currentUser} onNavigate={navigateView} onLogout={handleLogout} />}
      {view === "admin-login" && <AdminLogin setView={navigateView} onAuthenticated={setAdminUser} />}
      {view === "admin" && (
        <AdminDashboard
          adminUser={adminUser}
          setAdminUser={setAdminUser}
          setView={navigateView}
        />
      )}
    </>
  );
}
