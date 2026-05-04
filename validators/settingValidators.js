import { body } from "express-validator";

export const settingValidation = [
  body("shopName").optional().isString(),
  body("shopAddress").optional().isString(),
  body("shopPhone").optional().isString(),
  body("mapIframeUrl").optional().isString()
];
