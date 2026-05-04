import { ServiceRecord, Invoice, ServiceRecordItem } from "../models/index.js";

const invoiceRepository = {
  create(payload, options = {}) {
    return Invoice.create(payload, options);
  },

  findByServiceRecordId(serviceRecordId, options = {}) {
    return Invoice.findOne({
      where: { service_record_id: serviceRecordId },
      ...options
    });
  },

  findDetailForScso(scsoUserId, invoiceId) {
    return Invoice.findOne({
      where: { id: invoiceId },
      include: [
        {
          model: ServiceRecord,
          as: "service_record",
          required: true,
          where: { scso_user_id: scsoUserId },
          include: [{ model: ServiceRecordItem, as: "items", required: false }]
        }
      ]
    });
  },

  countForScso(scsoUserId) {
    return Invoice.count({
      include: [
        {
          model: ServiceRecord,
          as: "service_record",
          required: true,
          where: { scso_user_id: scsoUserId }
        }
      ]
    });
  }
};

export default invoiceRepository;
