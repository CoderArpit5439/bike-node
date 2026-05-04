import { Admin } from "../models/index.js";

const adminRepository = {
  findByEmail(email, options = {}) {
    return Admin.findOne({ where: { email }, ...options });
  },

  findByIdForAuth(id) {
    return Admin.findByPk(id, {
      attributes: ["id", "name", "email", "role", "status", "created_at"],
      raw: true
    });
  }
};

export default adminRepository;
