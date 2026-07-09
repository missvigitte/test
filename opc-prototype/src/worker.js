const DEFAULT_ADMIN_PASSWORD = "opc2026";
const ADMIN_STATUSES = new Set(["待跟进", "待分配", "已联系", "已转化", "已归档"]);
const ADMIN_OWNERS = new Set(["未分配", "Mia", "Nora", "Luna", "Yvonne"]);

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
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

function cleanNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

function normalizeRecord(body) {
  const record = body.record || body;
  const now = new Date().toISOString();
  const id = cleanText(record.id, 80) || `OPC-${Date.now().toString(36).toUpperCase()}`;
  const name = cleanText(record.name, 40);
  const phone = cleanText(record.phone, 24).replace(/[^\d+]/g, "");
  if (!name || !/^\+?\d{6,20}$/.test(phone)) {
    throw new Error("请先填写有效姓名和手机号。");
  }

  return {
    id,
    name,
    phone,
    createdAt: cleanText(record.createdAt, 40) || now,
    updatedAt: now,
    level: cleanText(record.level, 12),
    levelName: cleanText(record.levelName, 40),
    credit: cleanNumber(record.credit),
    businessScore: cleanNumber(record.businessScore),
    aiScore: cleanNumber(record.aiScore),
    category: cleanText(record.category, 80),
    match: cleanNumber(record.match),
    aiWeakness: cleanText(record.aiWeakness, 40),
    status: ADMIN_STATUSES.has(record.status) ? record.status : "待跟进",
    owner: ADMIN_OWNERS.has(record.owner) ? record.owner : "未分配",
    source: cleanText(record.source, 80) || "完整OPC测评",
    note: cleanText(record.note, 300),
    businessResult: body.businessResult ?? record.businessResult ?? null,
    aiResult: body.aiResult ?? record.aiResult ?? null,
    businessAnswers: body.businessAnswers ?? record.businessAnswers ?? [],
    aiAnswers: body.aiAnswers ?? record.aiAnswers ?? [],
  };
}

function rowToRecord(row) {
  return {
    id: row.id,
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

async function upsertRecord(env, body) {
  const record = normalizeRecord(body);
  await env.DB.prepare(`
    INSERT INTO assessment_records (
      id, name, phone, created_at, updated_at, level, level_name, credit,
      business_score, ai_score, category, match, ai_weakness, status, owner,
      source, note, business_result, ai_result, business_answers, ai_answers
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
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

async function handleApi(request, env, url) {
  if (!env.DB) return json({ ok: false, error: "数据库未绑定。" }, 500);

  if (request.method === "OPTIONS") return json({ ok: true });

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
      const record = await upsertRecord(env, body);
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
