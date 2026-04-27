const { body } = require("express-validator");

const settingValidation = [
  body("shopAddress").optional().isString(),
  body("shopPhone").optional().isString(),
  body("mapIframeUrl").optional().isString()
];

module.exports = {
  settingValidation
};
