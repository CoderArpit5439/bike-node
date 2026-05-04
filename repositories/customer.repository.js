import { Op } from "sequelize";
import { Bike, Customer, RewardWallet, ScsoUser, ServiceRecord } from "../models/index.js";

const customerRepository = {
  create(payload, options = {}) {
    return Customer.create(payload, options);
  },

  findByIdForScso(scsoUserId, customerId, options = {}) {
    return Customer.findOne({
      where: { id: customerId, scso_user_id: scsoUserId },
      ...options
    });
  },

  findAllForScso(scsoUserId, { search = "", fromDate = "", toDate = "", page, limit } = {}) {
    const where = {
        scso_user_id: scsoUserId,
        ...(search
          ? {
              [Op.or]: [
                { full_name: { [Op.like]: `%${search}%` } },
                { phone_number: { [Op.like]: `%${search}%` } },
                { "$primary_bike.bike_number$": { [Op.like]: `%${search}%` } }
              ]
            }
          : {})
      };

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) where.created_at[Op.gte] = new Date(`${fromDate}T00:00:00.000Z`);
      if (toDate) where.created_at[Op.lte] = new Date(`${toDate}T23:59:59.999Z`);
    }

    const query = {
      where,
      include: [
        { model: Bike, as: "primary_bike", required: false },
        { model: Bike, as: "bikes", required: false },
        { model: RewardWallet, as: "reward_wallet", required: false }
      ],
      order: [["created_at", "DESC"]],
      distinct: true
    };

    if (page !== undefined || limit !== undefined) {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
      query.limit = pageSize;
      query.offset = (pageNumber - 1) * pageSize;
      return Customer.findAndCountAll(query);
    }

    return Customer.findAll(query);
  },

  findDetailForScso(scsoUserId, customerId) {
    return Customer.findOne({
      where: { id: customerId, scso_user_id: scsoUserId },
      include: [
        { model: Bike, as: "primary_bike", required: false },
        { model: Bike, as: "bikes", required: false },
        { model: RewardWallet, as: "reward_wallet", required: false }
      ]
    });
  },

  findHistoryForScsoCustomer(scsoUserId, customerId) {
    return ServiceRecord.findAll({
      where: { scso_user_id: scsoUserId, customer_id: customerId },
      order: [["service_date", "DESC"]]
    });
  },

  findWalletScope(scsoUserId, customerId) {
    return Customer.findOne({
      where: { id: customerId, scso_user_id: scsoUserId },
      include: [{ model: RewardWallet, as: "reward_wallet", required: false }]
    });
  },

  findForRecord(scsoUserId, customerId, bikeId, options = {}) {
    return Customer.findOne({
      where: { id: customerId, scso_user_id: scsoUserId },
      include: [
        { model: Bike, as: "bikes", where: { id: bikeId }, required: true },
        { model: RewardWallet, as: "reward_wallet", required: true }
      ],
      ...options
    });
  },

  listAllForAdmin({ search = "" } = {}) {
    return Customer.findAll({
      where: search
        ? {
            [Op.or]: [
              { full_name: { [Op.like]: `%${search}%` } },
              { phone_number: { [Op.like]: `%${search}%` } },
              { "$scso_user.shop_name$": { [Op.like]: `%${search}%` } }
            ]
          }
        : undefined,
      include: [{ model: ScsoUser, as: "scso_user", required: true }],
      order: [["created_at", "DESC"]]
    });
  },

  countAll() {
    return Customer.count();
  },

  countForScso(scsoUserId) {
    return Customer.count({ where: { scso_user_id: scsoUserId } });
  },

  findRecentForAdmin(limit = 5) {
    return Customer.findAll({
      include: [{ model: ScsoUser, as: "scso_user", required: true }],
      order: [["created_at", "DESC"]],
      limit
    });
  },

  findRecentForScso(scsoUserId, limit = 5) {
    return Customer.findAll({
      where: { scso_user_id: scsoUserId },
      order: [["created_at", "DESC"]],
      limit
    });
  }
};

export default customerRepository;
