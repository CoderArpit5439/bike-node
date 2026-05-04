import { ServiceRecordItem } from "../models/index.js";

const serviceRecordItemRepository = {
  bulkCreate(items, options = {}) {
    return ServiceRecordItem.bulkCreate(items, options);
  },

  findByServiceRecordId(serviceRecordId) {
    return ServiceRecordItem.findAll({
      where: { service_record_id: serviceRecordId }
    });
  }
};

export default serviceRecordItemRepository;
