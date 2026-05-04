import { getSettingValue, upsertSetting } from "./commonService.js";
import scsoUserRepository from "../repositories/scsoUser.repository.js";

const settingService = {
  async getSettings(scsoUserId) {
    const [shop, mapIframeUrl] = await Promise.all([
      scsoUserRepository.findShopInfo(scsoUserId),
      getSettingValue("scso", scsoUserId, "map_iframe_url", process.env.DEFAULT_MAP_IFRAME || "")
    ]);

    return {
      shopName: shop?.shop_name || "",
      shopAddress: shop?.shop_address || "",
      shopPhone: shop?.phone || "",
      mapIframeUrl
    };
  },

  async updateSettings(scsoUserId, payload) {
    await Promise.all([
      scsoUserRepository.updateById(scsoUserId, {
        ...(payload.shopName !== undefined ? { shop_name: payload.shopName || "" } : {}),
        ...(payload.shopAddress !== undefined ? { shop_address: payload.shopAddress || null } : {}),
        ...(payload.shopPhone !== undefined ? { phone: payload.shopPhone || "" } : {})
      }),
      upsertSetting("scso", scsoUserId, "shop_address", payload.shopAddress || ""),
      upsertSetting("scso", scsoUserId, "shop_phone", payload.shopPhone || ""),
      upsertSetting("scso", scsoUserId, "map_iframe_url", payload.mapIframeUrl || "")
    ]);

    return this.getSettings(scsoUserId);
  },

  async getPublicSettings() {
    return {
      mapIframeUrl: await getSettingValue("global", null, "map_iframe_url", process.env.DEFAULT_MAP_IFRAME || "")
    };
  }
};

export default settingService;
