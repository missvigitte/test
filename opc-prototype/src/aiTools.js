export const aiToolCatalog = [
  { id: "kimi", name: "Kimi", provider: "月之暗面", areas: ["提示词库", "内容生产"], tag: "长文本与内容", access: "官方入口", url: "https://www.kimi.com/", description: "适合资料整理、选题拆解、长文初稿和知识问答。" },
  { id: "deepseek", name: "DeepSeek", provider: "深度求索", areas: ["提示词库", "数据复盘", "工具成本"], tag: "分析与推理", access: "官方入口", url: "https://chat.deepseek.com/", description: "适合结构化分析、表格结论、流程推演和低成本试用。" },
  { id: "doubao", name: "豆包", provider: "字节跳动", areas: ["提示词库", "内容生产"], tag: "日常创作", access: "官方入口", url: "https://www.doubao.com/", description: "适合日常文案、灵感整理、多模态内容辅助。" },
  { id: "canva", name: "Canva可画", provider: "Canva", areas: ["内容生产", "工具成本"], tag: "视觉内容", access: "可试用", url: "https://www.canva.cn/magic/", description: "适合封面、社交媒体素材、演示文稿与AI视觉设计。" },
  { id: "capcut", name: "剪映", provider: "字节跳动", areas: ["内容生产"], tag: "短视频", access: "官方下载", url: "https://www.capcut.cn/?lang=zh", description: "适合短视频剪辑、字幕、图文成片与常用AI视频能力。" },
  { id: "coze", name: "扣子", provider: "字节跳动", areas: ["自动化流程"], tag: "智能体与流程", access: "官方入口", url: "https://www.coze.cn/", description: "适合搭建智能体、知识库和多步骤工作流。" },
  { id: "feishu-base", name: "飞书多维表格", provider: "飞书", areas: ["自动化流程", "私域工具", "数据复盘"], tag: "数据与协作", access: "官方入口", url: "https://www.feishu.cn/product/base", description: "适合线索管理、内容排期、自动提醒和数据看板。" },
  { id: "wps-ai", name: "WPS AI", provider: "金山办公", areas: ["内容生产", "自动化流程", "数据复盘"], tag: "文档与表格", access: "官方入口", url: "https://ai.wps.cn/", description: "适合文档、演示和表格场景中的内容生成与整理。" },
  { id: "wecom", name: "企业微信", provider: "腾讯", areas: ["私域工具"], tag: "客户运营", access: "官方下载", url: "https://work.weixin.qq.com/", description: "适合客户联系、标签沉淀、群运营与团队协作。" },
  { id: "weiban", name: "微伴助手", provider: "微伴", areas: ["私域工具"], tag: "私域SCRM", access: "官方入口", url: "https://www.weibanzhushou.com/", description: "适合企业微信场景下的客户分层、SOP和跟进管理。" },
];

export function toolsForArea(area) {
  return aiToolCatalog.filter((tool) => tool.areas.includes(area));
}

export function toolsByIds(ids = []) {
  return ids.map((id) => aiToolCatalog.find((tool) => tool.id === id)).filter(Boolean);
}
