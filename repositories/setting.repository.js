import { Setting } from "../models/index.js";

const settingRepository = {
  findOne(scopeType, scopeId, settingKey, options = {}) {
    return Setting.findOne({
      where: {
        scope_type: scopeType,
        scope_id: scopeId,
        setting_key: settingKey
      },
      ...options
    });
  },

  async upsert(scopeType, scopeId, settingKey, settingValue, options = {}) {
    const existing = await Setting.findOne({
      where: {
        scope_type: scopeType,
        scope_id: scopeId,
        setting_key: settingKey
      },
      transaction: options.transaction
    });

    if (existing) {
      existing.setting_value = settingValue;
      await existing.save(options);
      return existing;
    }

    return Setting.create(
      {
        scope_type: scopeType,
        scope_id: scopeId,
        setting_key: settingKey,
        setting_value: settingValue
      },
      options
    );
  }
};

export default settingRepository;
