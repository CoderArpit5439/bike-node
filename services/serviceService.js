import { StatusCodes } from "http-status-codes";
import serviceRepository from "../repositories/service.repository.js";
import ApiError from "../utils/apiError.js";

const mapService = (service) => ({
  id: service.id,
  serviceName: service.service_name,
  description: service.description,
  price: Number(service.price),
  rewardPoints: service.reward_points,
  reminderMonths: service.reminder_months,
  status: service.status,
  createdAt: service.created_at
});

const serviceService = {
  async createService(scsoUserId, payload) {
    const service = await serviceRepository.create({
      scso_user_id: scsoUserId,
      service_name: payload.serviceName,
      description: payload.description || null,
      price: payload.price,
      reward_points: payload.rewardPoints,
      reminder_months: Number(payload.reminderMonths || 0),
      status: payload.status || "active"
    });

    return service.id;
  },

  async listServices(scsoUserId, filters) {
    const result = await serviceRepository.listForScso(scsoUserId, filters);
    if (result.rows) {
      const page = Math.max(Number(filters.page) || 1, 1);
      const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);
      return {
        items: result.rows.map(mapService),
        pagination: {
          page,
          limit,
          total: result.count,
          totalPages: Math.max(Math.ceil(result.count / limit), 1)
        }
      };
    }

    return result.map(mapService);
  },

  async updateService(scsoUserId, serviceId, payload) {
    const existing = await serviceRepository.findByIdForScso(scsoUserId, serviceId);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    await serviceRepository.updateForScso(scsoUserId, serviceId, {
      service_name: payload.serviceName,
      description: payload.description || null,
      price: payload.price,
      reward_points: payload.rewardPoints,
      reminder_months: Number(payload.reminderMonths || 0),
      status: payload.status || "active"
    });
  },

  async deleteService(scsoUserId, serviceId) {
    const deleted = await serviceRepository.deleteForScso(scsoUserId, serviceId);
    if (!deleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }
  }
};

export default serviceService;
