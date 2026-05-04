import { Op } from "sequelize";
import { ScsoUser } from "../models/index.js";

const mapSearch = (search) =>
  search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { shop_name: { [Op.like]: `%${search}%` } }
        ]
      }
    : {};

const scsoUserRepository = {
  findByEmail(email, options = {}) {
    return ScsoUser.findOne({ where: { email }, ...options });
  },

  create(payload, options = {}) {
    return ScsoUser.create(payload, options);
  },

  findById(id, options = {}) {
    return ScsoUser.findByPk(id, options);
  },

  findByIdForAuth(id) {
    return ScsoUser.findByPk(id, {
      attributes: ["id", "name", "email", "phone", "shop_name", "role", "status", "created_at"],
      raw: true
    });
  },

  async list({ search = "", status = "" } = {}) {
    const where = {
      ...mapSearch(search),
      ...(status ? { status } : {})
    };

    return ScsoUser.findAll({
      where,
      order: [["created_at", "DESC"]]
    });
  },

  updateById(id, payload, options = {}) {
    return ScsoUser.update(payload, { where: { id }, ...options });
  },

  countAll() {
    return ScsoUser.count();
  },

  findRecent(limit = 5) {
    return ScsoUser.findAll({
      order: [["created_at", "DESC"]],
      limit
    });
  },

  async toggleStatus(id) {
    const scsoUser = await ScsoUser.findByPk(id);
    if (!scsoUser) {
      return null;
    }

    scsoUser.status = scsoUser.status === "active" ? "inactive" : "active";
    await scsoUser.save();
    return scsoUser.status;
  },

  findShopInfo(id, options = {}) {
    return ScsoUser.findByPk(id, {
      attributes: ["shop_name", "phone", "shop_address", "whatsapp_number"],
      ...options
    });
  }
};

export default scsoUserRepository;
