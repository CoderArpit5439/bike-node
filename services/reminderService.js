import { StatusCodes } from "http-status-codes";
import customerRepository from "../repositories/customer.repository.js";
import reminderRepository from "../repositories/reminder.repository.js";
import ApiError from "../utils/apiError.js";

const reminderService = {
  async createReminder(scsoUserId, payload) {
    const customer = await customerRepository.findByIdForScso(scsoUserId, payload.customerId);
    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    const reminder = await reminderRepository.create({
      scso_user_id: scsoUserId,
      customer_id: payload.customerId,
      service_record_id: payload.serviceRecordId || null,
      reminder_type: payload.reminderType,
      message: payload.message,
      scheduled_at: payload.scheduledAt,
      status: payload.status || "pending"
    });

    return reminder.id;
  },

  async listReminders(scsoUserId, filters) {
    const reminders = await reminderRepository.listForScso(scsoUserId, filters);
    return reminders.map((reminder) => ({
      id: reminder.id,
      reminderType: reminder.reminder_type,
      message: reminder.message,
      scheduledAt: reminder.scheduled_at,
      lastServiceDate: reminder.service_record?.service_date || null,
      status: reminder.status,
      customerName: reminder.customer?.full_name
    }));
  },

  async updateReminder(scsoUserId, reminderId, payload) {
    const [affectedRows] = await reminderRepository.updateForScso(scsoUserId, reminderId, {
      reminder_type: payload.reminderType,
      message: payload.message,
      scheduled_at: payload.scheduledAt,
      status: payload.status
    });

    if (!affectedRows) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Reminder not found");
    }
  }
};

export default reminderService;
