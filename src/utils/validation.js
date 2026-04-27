const { validationResult } = require("express-validator");
const ApiError = require("./apiError");

const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(422, errors.array()[0].msg));
  }

  next();
};

module.exports = { validate };
