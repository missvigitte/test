import {
  aiQuestions,
  calculateAi,
  calculateBusiness,
  commercialQuestions,
  creditScore,
  isAssessmentComplete,
} from "./assessment.js";

const DEFAULT_ADMIN_PASSWORD = "opc2026";
const ADMIN_STATUSES = new Set(["待跟进", "待分配", "已联系", "已转化", "已归档"]);
const ADMIN_OWNERS = new Set(["未分配", "Mia", "Nora", "Luna", "Yvonne"]);
const ASSESSMENT_TYPES = new Set(["business", "ai", "opc"]);
const SESSION_COOKIE = "opc_user_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 100000;

function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function cleanText(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizePhone(value) {
  return cleanText(value, 24).replace(/[^\d+]/g, "");
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) ?? []);
}

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    salt: hexToBytes(saltHex),
    iterations: PASSWORD_ITERATIONS,
  }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

function randomHex(size = 24) {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(size)));
}

function readCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const pair = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

function sessionCookie(token, maxAge = SESSION_MAX_AGE) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function publicUser(row) {
  return row ? {
    id: row.id,
    name: row.name,
    phone: row.phone,
    createdAt: row.created_at,
  } : null;
}

async function userFromRequest(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(`
    SELECT u.id, u.name, u.phone, u.created_at
    FROM user_sessions s
    JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).bind(tokenHash, now).first();
  return publicUser(row);
}

async function createUserSession(env, userId) {
  const token = `${crypto.randomUUID()}.${randomHex(24)}`;
  const tokenHash = await hashToken(token);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_MAX_AGE * 1000);
  await env.DB.prepare(`
    INSERT INTO user_sessions (token_hash, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(tokenHash, userId, createdAt.toISOString(), expiresAt.toISOString()).run();
  return token;
}

function stringifyJson(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "null";
  }
}

function parseJson(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function adminPassword(env) {
  return env.ADMIN_API_KEY || DEFAULT_ADMIN_PASSWORD;
}

function isAdminRequest(request, env) {
  return request.headers.get("x-admin-key") === adminPassword(env);
}

function normalizeRecord(body, userId = null) {
  const record = body.record || body;
  const assessmentType = ASSESSMENT_TYPES.has(body.assessmentType)
    ? body.assessmentType
    : ASSESSMENT_TYPES.has(record.assessmentType) ? record.assessmentType : "opc";
  const businessAnswers = body.businessAnswers ?? record.businessAnswers ?? [];
  const aiAnswers = body.aiAnswers ?? record.aiAnswers ?? [];
  const needsBusiness = assessmentType === "business" || assessmentType === "opc";
  const needsAi = assessmentType === "ai" || assessmentType === "opc";
  if (needsBusiness && !isAssessmentComplete(businessAnswers, commercialQuestions)) {
    throw new Error(`商业测评必须完整提交${commercialQuestions.length}题。`);
  }
  if (needsAi && !isAssessmentComplete(aiAnswers, aiQuestions)) {
    throw new Error(`AI工具测评必须完整提交${aiQuestions.length}题。`);
  }

  const businessResult = needsBusiness ? calculateBusiness(businessAnswers) : null;
  const aiResult = needsAi ? calculateAi(aiAnswers) : null;
  const primaryCategory = businessResult?.recommendedCategories[0] ?? null;
  const now = new Date().toISOString();
  const id = cleanText(record.id, 80) || `OPC-${Date.now().toString(36).toUpperCase()}`;
  const name = cleanText(record.name, 40);
  const phone = normalizePhone(record.phone);
  if (!name || !/^\+?\d{6,20}$/.test(phone)) {
    throw new Error("请先填写有效姓名和手机号。");
  }

  const sourceByType = {
    business: "商业能力测评",
    ai: "AI工具测评",
    opc: "完整OPC测评",
  };
  const defaultNote = assessmentType === "business"
    ? `主推${primaryCategory.short}，商业潜力${businessResult.totalScore}分。`
    : assessmentType === "ai"
      ? `AI工具短板为${aiResult.weakest}，综合熟练度${aiResult.total}分。`
      : `主推${primaryCategory.short}，优先补${aiResult.weakest}。`;

  return {
    id,
    assessmentType,
    userId,
    name,
    phone,
    createdAt: cleanText(record.createdAt, 40) || now,
    updatedAt: now,
    level: businessResult?.level.level ?? "",
    levelName: businessResult?.level.name ?? "",
    credit: businessResult ? creditScore(businessResult) : null,
    businessScore: businessResult?.totalScore ?? null,
    aiScore: aiResult?.total ?? null,
    category: primaryCategory?.name ?? "",
    match: primaryCategory?.match ?? null,
    aiWeakness: aiResult?.weakest ?? "",
    status: ADMIN_STATUSES.has(record.status) ? record.status : "待跟进",
    owner: ADMIN_OWNERS.has(record.owner) ? record.owner : "未分配",
    source: cleanText(record.source, 80) || sourceByType[assessmentType],
    note: cleanText(record.note, 300) || defaultNote,
    businessResult,
    aiResult,
    businessAnswers: needsBusiness ? businessAnswers : [],
    aiAnswers: needsAi ? aiAnswers : [],
  };
}

function rowToRecord(row) {
  return {
    id: row.id,
    assessmentType: row.assessment_type || "opc",
    userId: row.user_id || null,
    name: row.name,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    level: row.level,
    levelName: row.level_name,
    credit: row.credit,
    businessScore: row.business_score,
    aiScore: row.ai_score,
    category: row.category,
    match: row.match,
    aiWeakness: row.ai_weakness,
    status: row.status,
    owner: row.owner,
    source: row.source,
    note: row.note,
    businessResult: parseJson(row.business_result),
    aiResult: parseJson(row.ai_result),
    businessAnswers: parseJson(row.business_answers, []),
    aiAnswers: parseJson(row.ai_answers, []),
  };
}

async function upsertRecord(env, body, userId = null) {
  const record = normalizeRecord(body, userId);
  await env.DB.prepare(`
    INSERT INTO assessment_records (
      id, assessment_type, user_id, name, phone, created_at, updated_at, level, level_name, credit,
      business_score, ai_score, category, match, ai_weakness, status, owner,
      source, note, business_result, ai_result, business_answers, ai_answers
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      assessment_type = excluded.assessment_type,
      user_id = COALESCE(excluded.user_id, assessment_records.user_id),
      name = excluded.name,
      phone = excluded.phone,
      updated_at = excluded.updated_at,
      level = excluded.level,
      level_name = excluded.level_name,
      credit = excluded.credit,
      business_score = excluded.business_score,
      ai_score = excluded.ai_score,
      category = excluded.category,
      match = excluded.match,
      ai_weakness = excluded.ai_weakness,
      status = excluded.status,
      owner = excluded.owner,
      source = excluded.source,
      note = excluded.note,
      business_result = excluded.business_result,
      ai_result = excluded.ai_result,
      business_answers = excluded.business_answers,
      ai_answers = excluded.ai_answers
  `).bind(
    record.id,
    record.assessmentType,
    record.userId,
    record.name,
    record.phone,
    record.createdAt,
    record.updatedAt,
    record.level,
    record.levelName,
    record.credit,
    record.businessScore,
    record.aiScore,
    record.category,
    record.match,
    record.aiWeakness,
    record.status,
    record.owner,
    record.source,
    record.note,
    stringifyJson(record.businessResult),
    stringifyJson(record.aiResult),
    stringifyJson(record.businessAnswers),
    stringifyJson(record.aiAnswers),
  ).run();

  const row = await env.DB.prepare("SELECT * FROM assessment_records WHERE id = ?").bind(record.id).first();
  return rowToRecord(row);
}

async function listRecords(env) {
  const result = await env.DB.prepare(`
    SELECT * FROM assessment_records
    ORDER BY created_at DESC, updated_at DESC
    LIMIT 500
  `).all();
  return (result.results || []).map(rowToRecord);
}

async function listUserRecords(env, userId) {
  const result = await env.DB.prepare(`
    SELECT * FROM assessment_records
    WHERE user_id = ?
    ORDER BY created_at DESC, updated_at DESC
    LIMIT 200
  `).bind(userId).all();
  return (result.results || []).map(rowToRecord);
}

async function patchRecord(env, id, body) {
  const existing = await env.DB.prepare("SELECT * FROM assessment_records WHERE id = ?").bind(id).first();
  if (!existing) return null;
  const status = ADMIN_STATUSES.has(body.status) ? body.status : existing.status;
  const owner = ADMIN_OWNERS.has(body.owner) ? body.owner : existing.owner;
  const note = Object.prototype.hasOwnProperty.call(body, "note") ? cleanText(body.note, 300) : existing.note;
  const updatedAt = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE assessment_records
    SET status = ?, owner = ?, note = ?, updated_at = ?
    WHERE id = ?
  `).bind(status, owner, note, updatedAt, id).run();

  const row = await env.DB.prepare("SELECT * FROM assessment_records WHERE id = ?").bind(id).first();
  return rowToRecord(row);
}

async function registerUser(request, env) {
  const body = await readJson(request);
  const name = cleanText(body.name, 40).replace(/\s+/g, "");
  const phone = normalizePhone(body.phone);
  const password = String(body.password ?? "");
  if (!name || name.length > 24) return json({ ok: false, error: "请填写有效姓名。" }, 400);
  if (!/^\+?\d{6,20}$/.test(phone)) return json({ ok: false, error: "请填写有效手机号。" }, 400);
  if (password.length < 8 || password.length > 72) {
    return json({ ok: false, error: "密码需要8-72位。" }, 400);
  }
  const existing = await env.DB.prepare("SELECT id FROM app_users WHERE phone = ?").bind(phone).first();
  if (existing) return json({ ok: false, error: "该手机号已注册，请直接登录。" }, 409);

  const id = `USR-${crypto.randomUUID()}`;
  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO app_users (id, name, phone, password_hash, password_salt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, name, phone, passwordHash, salt, now, now).run();
  const token = await createUserSession(env, id);
  return json({ ok: true, user: { id, name, phone, createdAt: now } }, 201, {
    "Set-Cookie": sessionCookie(token),
  });
}

async function loginUser(request, env) {
  const body = await readJson(request);
  const phone = normalizePhone(body.phone);
  const password = String(body.password ?? "");
  const user = await env.DB.prepare("SELECT * FROM app_users WHERE phone = ?").bind(phone).first();
  if (!user) return json({ ok: false, error: "手机号或密码不正确。" }, 401);
  const passwordHash = await hashPassword(password, user.password_salt);
  if (passwordHash !== user.password_hash) {
    return json({ ok: false, error: "手机号或密码不正确。" }, 401);
  }
  const token = await createUserSession(env, user.id);
  return json({ ok: true, user: publicUser(user) }, 200, {
    "Set-Cookie": sessionCookie(token),
  });
}

async function logoutUser(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) {
    const tokenHash = await hashToken(token);
    await env.DB.prepare("DELETE FROM user_sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}

async function handleApi(request, env, url) {
  if (!env.DB) return json({ ok: false, error: "数据库未绑定。" }, 500);

  if (request.method === "OPTIONS") return json({ ok: true });

  if (url.pathname === "/api/auth/register" && request.method === "POST") {
    try {
      return await registerUser(request, env);
    } catch {
      return json({ ok: false, error: "注册服务暂时不可用，请稍后重试。" }, 500);
    }
  }

  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    try {
      return await loginUser(request, env);
    } catch {
      return json({ ok: false, error: "登录服务暂时不可用，请稍后重试。" }, 500);
    }
  }

  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    return logoutUser(request, env);
  }

  if (url.pathname === "/api/auth/me" && request.method === "GET") {
    const user = await userFromRequest(request, env);
    return json({ ok: true, user });
  }

  if (url.pathname === "/api/me/records" && request.method === "GET") {
    const user = await userFromRequest(request, env);
    if (!user) return json({ ok: false, error: "请先登录。" }, 401);
    return json({ ok: true, records: await listUserRecords(env, user.id) });
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const body = await readJson(request);
    const account = cleanText(body.account, 40);
    const password = cleanText(body.password, 80);
    if (account === "admin" && password === adminPassword(env)) {
      return json({ ok: true });
    }
    return json({ ok: false, error: "账号或密码不正确。" }, 401);
  }

  if (url.pathname === "/api/records" && request.method === "POST") {
    const body = await readJson(request);
    try {
      const user = await userFromRequest(request, env);
      if (!user) return json({ ok: false, error: "请先登录后提交测评。" }, 401);
      const record = await upsertRecord(env, body, user.id);
      return json({ ok: true, record }, 201);
    } catch (error) {
      return json({ ok: false, error: error.message || "记录保存失败。" }, 400);
    }
  }

  if (url.pathname === "/api/records" && request.method === "GET") {
    if (!isAdminRequest(request, env)) return json({ ok: false, error: "未授权访问。" }, 401);
    const records = await listRecords(env);
    return json({ ok: true, records });
  }

  const recordMatch = url.pathname.match(/^\/api\/records\/([^/]+)$/);
  if (recordMatch) {
    if (!isAdminRequest(request, env)) return json({ ok: false, error: "未授权访问。" }, 401);
    const id = decodeURIComponent(recordMatch[1]);

    if (request.method === "PATCH") {
      const body = await readJson(request);
      const record = await patchRecord(env, id, body);
      if (!record) return json({ ok: false, error: "记录不存在。" }, 404);
      return json({ ok: true, record });
    }

    if (request.method === "DELETE") {
      await env.DB.prepare("DELETE FROM assessment_records WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  }

  return json({ ok: false, error: "接口不存在。" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};
