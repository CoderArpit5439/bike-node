import { StatusCodes } from "http-status-codes";
import sequelize from "../config/database.js";
import bikeRepository from "../repositories/bike.repository.js";
import customerRepository from "../repositories/customer.repository.js";
import rewardTransactionRepository from "../repositories/rewardTransaction.repository.js";
import rewardWalletRepository from "../repositories/rewardWallet.repository.js";
import ApiError from "../utils/apiError.js";

const mapCustomerSummary = (customer) => ({
  id: customer.id,
  fullName: customer.full_name,
  phoneNumber: customer.phone_number,
  whatsappNumber: customer.whatsapp_number,
  lastServiceDate: customer.last_service_date,
  createdAt: customer.created_at,
  bikeId: customer.primary_bike?.id || null,
  bikeModel: customer.primary_bike?.bike_model || null,
  bikeNumber: customer.primary_bike?.bike_number || null,
  bikes: customer.bikes?.map((bike) => ({
    id: bike.id,
    bikeModel: bike.bike_model,
    bikeNumber: bike.bike_number,
    isPrimary: bike.is_primary
  })) || [],
  walletBalance: customer.reward_wallet?.current_balance || 0
});

const customerService = {
  async createCustomer(scsoUserId, payload) {
    return sequelize.transaction(async (transaction) => {
      const customer = await customerRepository.create(
        {
          scso_user_id: scsoUserId,
          full_name: payload.fullName,
          phone_number: payload.phoneNumber,
          whatsapp_number: payload.whatsappNumber || null,
          address: payload.address || null,
          last_service_date: payload.lastServiceDate || null,
          notes: payload.notes || null
        },
        { transaction }
      );

      await bikeRepository.create(
        {
          customer_id: customer.id,
          bike_model: payload.bikeModel,
          bike_number: payload.bikeNumber,
          is_primary: true
        },
        { transaction }
      );

      await rewardWalletRepository.create(
        {
          customer_id: customer.id,
          current_balance: 0
        },
        { transaction }
      );

      return customer.id;
    });
  },

  async listCustomers(scsoUserId, filters) {
    const result = await customerRepository.findAllForScso(scsoUserId, filters);
    if (result.rows) {
      const page = Math.max(Number(filters.page) || 1, 1);
      const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);
      return {
        items: result.rows.map(mapCustomerSummary),
        pagination: {
          page,
          limit,
          total: result.count,
          totalPages: Math.max(Math.ceil(result.count / limit), 1)
        }
      };
    }

    return result.map(mapCustomerSummary);
  },

  async getCustomerDetails(scsoUserId, customerId) {
    const customer = await customerRepository.findDetailForScso(scsoUserId, customerId);
    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    const history = await customerRepository.findHistoryForScsoCustomer(scsoUserId, customerId);

    return {
      customer: {
        id: customer.id,
        fullName: customer.full_name,
        phoneNumber: customer.phone_number,
        whatsappNumber: customer.whatsapp_number,
        address: customer.address,
        lastServiceDate: customer.last_service_date,
        notes: customer.notes,
        createdAt: customer.created_at,
        bikeId: customer.primary_bike?.id || null,
        bikeModel: customer.primary_bike?.bike_model || null,
        bikeNumber: customer.primary_bike?.bike_number || null,
        bikes: customer.bikes?.map((bike) => ({
          id: bike.id,
          bikeModel: bike.bike_model,
          bikeNumber: bike.bike_number,
          isPrimary: bike.is_primary
        })) || [],
        walletBalance: customer.reward_wallet?.current_balance || 0
      },
      history: history.map((record) => ({
        id: record.id,
        serviceDate: record.service_date,
        totalAmount: Number(record.total_amount),
        discountAmount: Number(record.discount_amount),
        finalAmount: Number(record.final_amount),
        pointsEarned: record.points_earned,
        pointsUsed: record.points_used,
        serviceNotes: record.service_notes
      }))
    };
  },

  async updateCustomer(scsoUserId, customerId, payload) {
    await sequelize.transaction(async (transaction) => {
      const customer = await customerRepository.findByIdForScso(scsoUserId, customerId, { transaction });

      if (!customer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
      }

      await customer.update(
        {
          full_name: payload.fullName,
          phone_number: payload.phoneNumber,
          whatsapp_number: payload.whatsappNumber || null,
          address: payload.address || null,
          last_service_date: payload.lastServiceDate || null,
          notes: payload.notes || null
        },
        { transaction }
      );

      await bikeRepository.updatePrimaryByCustomerId(
        customerId,
        {
          bike_model: payload.bikeModel,
          bike_number: payload.bikeNumber
        },
        { transaction }
      );
    });
  },

  async addBike(scsoUserId, customerId, payload) {
    const customer = await customerRepository.findByIdForScso(scsoUserId, customerId);
    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    const bike = await bikeRepository.create({
      customer_id: customerId,
      bike_model: payload.bikeModel,
      bike_number: payload.bikeNumber,
      is_primary: false
    });

    return bike.id;
  },

  async getWalletSummary(scsoUserId, customerId) {
    const customer = await customerRepository.findWalletScope(scsoUserId, customerId);

    if (!customer?.reward_wallet) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Wallet not found");
    }

    const transactions = await rewardTransactionRepository.findByWalletId(customer.reward_wallet.id);

    return {
      wallet: {
        id: customer.reward_wallet.id,
        currentBalance: customer.reward_wallet.current_balance
      },
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        serviceRecordId: transaction.service_record_id,
        type: transaction.type,
        points: transaction.points,
        note: transaction.note,
        createdAt: transaction.created_at
      }))
    };
  }
};

export default customerService;
