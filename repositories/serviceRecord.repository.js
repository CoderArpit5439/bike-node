import { fn, col, literal, Op } from "sequelize";
import { Bike, Customer, Invoice, ServiceRecord } from "../models/index.js";

const buildRecordWhere = (scsoUserId, { fromDate = "", toDate = "" } = {}) => {
  const where = { scso_user_id: scsoUserId };

  if (fromDate || toDate) {
    where.service_date = {};

    if (fromDate) {
      where.service_date[Op.gte] = new Date(`${fromDate}T00:00:00.000Z`);
    }

    if (toDate) {
      where.service_date[Op.lte] = new Date(`${toDate}T23:59:59.999Z`);
    }
  }

  return where;
};

const buildRecordSearch = (search = "") =>
  search
    ? {
        [Op.or]: [
          { "$customer.full_name$": { [Op.like]: `%${search}%` } },
          { "$customer.phone_number$": { [Op.like]: `%${search}%` } },
          { "$bike.bike_model$": { [Op.like]: `%${search}%` } },
          { "$bike.bike_number$": { [Op.like]: `%${search}%` } }
        ]
      }
    : {};

const buildRecordOrder = (sortBy = "serviceDate", sortOrder = "desc") => {
  const direction = String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";

  const sortMap = {
    serviceDate: ["service_date", direction],
    finalAmount: ["final_amount", direction],
    pointsEarned: ["points_earned", direction],
    customerName: [{ model: Customer, as: "customer" }, "full_name", direction]
  };

  return [sortMap[sortBy] || sortMap.serviceDate];
};

const serviceRecordRepository = {
  create(payload, options = {}) {
    return ServiceRecord.create(payload, options);
  },

  listForScso(scsoUserId, filters = {}) {
    const { search = "", page, limit, sortBy = "serviceDate", sortOrder = "desc" } = filters;
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const shouldPaginate = page !== undefined || limit !== undefined;
    const query = {
      where: {
        ...buildRecordWhere(scsoUserId, filters),
        ...buildRecordSearch(search)
      },
      include: [
        { model: Customer, as: "customer", required: true },
        { model: Bike, as: "bike", required: true },
        { model: Invoice, as: "invoice", required: false }
      ],
      order: buildRecordOrder(sortBy, sortOrder),
      distinct: true,
      subQuery: false
    };

    if (shouldPaginate) {
      query.limit = pageSize;
      query.offset = (pageNumber - 1) * pageSize;
      return ServiceRecord.findAndCountAll(query);
    }

    return ServiceRecord.findAll(query);
  },

  findDetailForScso(scsoUserId, recordId) {
    return ServiceRecord.findOne({
      where: { id: recordId, scso_user_id: scsoUserId },
      include: [
        { model: Customer, as: "customer", required: true },
        { model: Bike, as: "bike", required: true }
      ]
    });
  },

  sumRewardPointsForScso(scsoUserId) {
    return ServiceRecord.sum("points_earned", { where: { scso_user_id: scsoUserId } });
  },

  countForScso(scsoUserId) {
    return ServiceRecord.count({ where: { scso_user_id: scsoUserId } });
  },

  findRecentForScso(scsoUserId, limit = 5) {
    return ServiceRecord.findAll({
      where: { scso_user_id: scsoUserId },
      include: [{ model: Customer, as: "customer", required: true }],
      order: [["service_date", "DESC"]],
      limit
    });
  },

  findChartDataForScso(scsoUserId) {
    return ServiceRecord.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("service_date"), "%Y-%m"), "month"],
        [fn("COUNT", col("id")), "totalServices"],
        [fn("SUM", col("final_amount")), "revenue"]
      ],
      where: { scso_user_id: scsoUserId },
      group: [fn("DATE_FORMAT", col("service_date"), "%Y-%m")],
      order: [[literal("month"), "DESC"]],
      limit: 6,
      raw: true
    });
  }
};

export default serviceRecordRepository;
