import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import customerRepository from "../repositories/customer.repository.js";
import reminderRepository from "../repositories/reminder.repository.js";
import scsoUserRepository from "../repositories/scsoUser.repository.js";
import serviceRepository from "../repositories/service.repository.js";
import ApiError from "../utils/apiError.js";

const mapScso = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  shopName: user.shop_name,
  shopAddress: user.shop_address,
  whatsappNumber: user.whatsapp_number,
  status: user.status,
  createdAt: user.created_at
});

const mapAdminCustomer = (customer) => ({
  id: customer.id,
  fullName: customer.full_name,
  phoneNumber: customer.phone_number,
  whatsappNumber: customer.whatsapp_number,
  lastServiceDate: customer.last_service_date,
  createdAt: customer.created_at,
  ownerName: customer.scso_user?.name,
  shopName: customer.scso_user?.shop_name
});

const adminService = {
  async createScso(payload, adminId) {
    const existing = await scsoUserRepository.findByEmail(payload.email);
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "SCSO email already exists");
    }

    const password = payload.password || "Scso@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const scsoUser = await scsoUserRepository.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: hashedPassword,
      shop_name: payload.shopName,
      shop_address: payload.shopAddress || null,
      whatsapp_number: payload.whatsappNumber || null,
      created_by_admin_id: adminId
    });

    return scsoUser.id;
  },

  async listScso(filters) {
    const users = await scsoUserRepository.list(filters);
    return users.map(mapScso);
  },

  async updateScso(id, payload) {
    const existing = await scsoUserRepository.findById(id);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "SCSO not found");
    }

    await scsoUserRepository.updateById(id, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      shop_name: payload.shopName,
      shop_address: payload.shopAddress || null,
      whatsapp_number: payload.whatsappNumber || null
    });
  },

  async toggleScsoStatus(id) {
    const nextStatus = await scsoUserRepository.toggleStatus(id);

    if (!nextStatus) {
      throw new ApiError(StatusCodes.NOT_FOUND, "SCSO not found");
    }

    return nextStatus;
  },

  async listAllCustomers(filters) {
    const customers = await customerRepository.listAllForAdmin(filters);
    return customers.map(mapAdminCustomer);
  },

  async getDashboardAnalytics() {
    const [totalScso, totalCustomers, totalServices, totalReminders, recentScso, recentCustomers] = await Promise.all([
      scsoUserRepository.countAll(),
      customerRepository.countAll(),
      serviceRepository.countAll(),
      reminderRepository.countAll(),
      scsoUserRepository.findRecent(5),
      customerRepository.findRecentForAdmin(5)
    ]);

    return {
      counts: {
        totalScso,
        totalCustomers,
        totalServices,
        totalReminders
      },
      recentScso: recentScso.map(mapScso),
      recentCustomers: recentCustomers.map((customer) => ({
        id: customer.id,
        fullName: customer.full_name,
        phoneNumber: customer.phone_number,
        shopName: customer.scso_user?.shop_name,
        createdAt: customer.created_at
      }))
    };
  }
};

export default adminService;
