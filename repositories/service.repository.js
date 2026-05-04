import { Op } from "sequelize";
import { Service } from "../models/index.js";

const serviceRepository = {
  create(payload, options = {}) {
    return Service.create(payload, options);
  },

  listForScso(scsoUserId, { search = "", fromDate = "", toDate = "", page, limit } = {}) {
    const where = {
        scso_user_id: scsoUserId,
        ...(search ? { service_name: { [Op.like]: `%${search}%` } } : {})
      };

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) where.created_at[Op.gte] = new Date(`${fromDate}T00:00:00.000Z`);
      if (toDate) where.created_at[Op.lte] = new Date(`${toDate}T23:59:59.999Z`);
    }

    const query = {
      where,
      order: [["created_at", "DESC"]]
    };

    if (page !== undefined || limit !== undefined) {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
      query.limit = pageSize;
      query.offset = (pageNumber - 1) * pageSize;
      return Service.findAndCountAll(query);
    }

    return Service.findAll(query);
  },

  findByIdForScso(scsoUserId, serviceId, options = {}) {
    return Service.findOne({
      where: { id: serviceId, scso_user_id: scsoUserId },
      ...options
    });
  },

  updateForScso(scsoUserId, serviceId, payload, options = {}) {
    return Service.update(payload, {
      where: { id: serviceId, scso_user_id: scsoUserId },
      ...options
    });
  },

  deleteForScso(scsoUserId, serviceId, options = {}) {
    return Service.destroy({
      where: { id: serviceId, scso_user_id: scsoUserId },
      ...options
    });
  },

  findActiveByIds(scsoUserId, serviceIds, options = {}) {
    return Service.findAll({
      where: {
        scso_user_id: scsoUserId,
        id: serviceIds,
        status: "active"
      },
      ...options
    });
  },

  countAll() {
    return Service.count();
  },

  countForScso(scsoUserId) {
    return Service.count({ where: { scso_user_id: scsoUserId } });
  }
};

export default serviceRepository;
