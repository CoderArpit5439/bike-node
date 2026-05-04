import settingRepository from "../repositories/setting.repository.js";

export const getSettingValue = async (scopeType, scopeId, key, fallback = "") => {
  const setting = await settingRepository.findOne(scopeType, scopeId, key);
  return setting?.setting_value ?? fallback;
};

export const upsertSetting = async (scopeType, scopeId, key, value, options = {}) => {
  await settingRepository.upsert(scopeType, scopeId, key, value, options);
};
