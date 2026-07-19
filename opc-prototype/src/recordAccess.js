export function publicRecordForUser(record) {
  const {
    status,
    owner,
    source,
    note,
    unlockedAt,
    unlockedBy,
    userCreatedAt,
    ...publicRecord
  } = record;

  if (publicRecord.assessmentType !== "opc" || publicRecord.reportUnlocked) {
    return publicRecord;
  }

  const business = publicRecord.businessResult;
  const ai = publicRecord.aiResult;
  return {
    ...publicRecord,
    businessResult: business ? {
      totalScore: business.totalScore,
      level: business.level,
      strongestDim: business.strongestDim,
      recommendedCategories: business.recommendedCategories?.slice(0, 3) ?? [],
    } : null,
    aiResult: ai ? {
      total: ai.total,
      strongest: ai.strongest,
      weakest: ai.weakest,
    } : null,
    businessAnswers: [],
    aiAnswers: [],
  };
}

export function uniqueUserKey(record) {
  return record.userId || (record.phone ? `phone:${record.phone}` : `record:${record.id}`);
}

export function countUniqueUsers(records = []) {
  return new Set(records.map(uniqueUserKey)).size;
}
