import { Customer, Reminder, ServiceRecord } from "../models/index.js";

const reminderRepository = {
  create(payload, options = {}) {
    return Reminder.create(payload, options);
  },

  listForScso(scsoUserId, { status = "" } = {}) {
    return Reminder.findAll({
      where: {
        scso_user_id: scsoUserId,
        ...(status ? { status } : {})
      },
      include: [
        { model: Customer, as: "customer", required: true },
        { model: ServiceRecord, as: "service_record", required: false }
      ],
      order: [["scheduled_at", "ASC"]]
    });
  },

  updateForScso(scsoUserId, reminderId, payload, options = {}) {
    return Reminder.update(payload, {
      where: { id: reminderId, scso_user_id: scsoUserId },
      ...options
    });
  },

  countAll() {
    return Reminder.count();
  },

  countForScso(scsoUserId) {
    return Reminder.count({ where: { scso_user_id: scsoUserId } });
  }
};

export default reminderRepository;
