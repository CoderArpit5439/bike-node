import { Bike } from "../models/index.js";

const bikeRepository = {
  create(payload, options = {}) {
    return Bike.create(payload, options);
  },

  findPrimaryByCustomerId(customerId, options = {}) {
    return Bike.findOne({
      where: { customer_id: customerId, is_primary: true },
      ...options
    });
  },

  findByCustomerId(customerId, options = {}) {
    return Bike.findAll({
      where: { customer_id: customerId },
      order: [["is_primary", "DESC"], ["created_at", "DESC"]],
      ...options
    });
  },

  updatePrimaryByCustomerId(customerId, payload, options = {}) {
    return Bike.update(payload, {
      where: { customer_id: customerId, is_primary: true },
      ...options
    });
  }
};

export default bikeRepository;
