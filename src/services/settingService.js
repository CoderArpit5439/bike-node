const { getSettingValue, upsertSetting } = require("./commonService");

const getSettings = async (scsoUserId) => {
  const [shopAddress, shopPhone, mapIframeUrl] = await Promise.all([
    getSettingValue("scso", scsoUserId, "shop_address", ""),
    getSettingValue("scso", scsoUserId, "shop_phone", ""),
    getSettingValue("scso", scsoUserId, "map_iframe_url", process.env.DEFAULT_MAP_IFRAME || "")
  ]);

  return {
    shopAddress,
    shopPhone,
    mapIframeUrl
  };
};

const updateSettings = async (scsoUserId, payload) => {
  await Promise.all([
    upsertSetting("scso", scsoUserId, "shop_address", payload.shopAddress || ""),
    upsertSetting("scso", scsoUserId, "shop_phone", payload.shopPhone || ""),
    upsertSetting("scso", scsoUserId, "map_iframe_url", payload.mapIframeUrl || "")
  ]);
};

const getPublicSettings = async () => ({
  mapIframeUrl: await getSettingValue("global", null, "map_iframe_url", process.env.DEFAULT_MAP_IFRAME || "")
});

module.exports = {
  getSettings,
  updateSettings,
  getPublicSettings
};
