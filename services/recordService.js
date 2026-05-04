import { StatusCodes } from "http-status-codes";
import sequelize from "../config/database.js";
import customerRepository from "../repositories/customer.repository.js";
import invoiceRepository from "../repositories/invoice.repository.js";
import reminderRepository from "../repositories/reminder.repository.js";
import rewardTransactionRepository from "../repositories/rewardTransaction.repository.js";
import rewardWalletRepository from "../repositories/rewardWallet.repository.js";
import scsoUserRepository from "../repositories/scsoUser.repository.js";
import serviceRecordItemRepository from "../repositories/serviceRecordItem.repository.js";
import serviceRecordRepository from "../repositories/serviceRecord.repository.js";
import serviceRepository from "../repositories/service.repository.js";
import ApiError from "../utils/apiError.js";

const createInvoiceNumber = (recordId) => `INV-${String(recordId).padStart(5, "0")}`;

const buildWhatsappLink = (phoneNumber, message) =>
  `https://wa.me/${String(phoneNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

const buildServiceReminderDate = (serviceDate, months) => {
  const reminderDate = new Date(serviceDate);
  reminderDate.setMonth(reminderDate.getMonth() + Number(months));
  reminderDate.setDate(reminderDate.getDate() - 15);
  return reminderDate;
};

const recordService = {
  async createServiceRecord(scsoUserId, payload) {
    return sequelize.transaction(async (transaction) => {
      const customer = await customerRepository.findForRecord(scsoUserId, payload.customerId, payload.bikeId, {
        transaction
      });

      if (!customer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Customer or bike not found");
      }

      const bike = customer.bikes?.[0];
      const wallet = customer.reward_wallet;

      const services = await serviceRepository.findActiveByIds(scsoUserId, payload.serviceIds, { transaction });
      if (!services.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No valid services selected");
      }

      const subtotal = services.reduce((sum, item) => sum + Number(item.price), 0);
      const pointsEarned = services.reduce((sum, item) => sum + Number(item.reward_points), 0);
      const discountAmount = Number(payload.discountAmount || 0);
      const pointsToRedeem = Number(payload.pointsToRedeem || 0);

      if (pointsToRedeem > wallet.current_balance) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient wallet points");
      }

      const finalAmount = Math.max(subtotal - discountAmount - pointsToRedeem, 0);

      const record = await serviceRecordRepository.create(
        {
          scso_user_id: scsoUserId,
          customer_id: payload.customerId,
          bike_id: payload.bikeId,
          service_date: payload.serviceDate || new Date(),
          service_notes: payload.serviceNotes || null,
          total_amount: subtotal,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          points_earned: pointsEarned,
          points_used: pointsToRedeem,
          reminder_date: payload.reminderDate || null
        },
        { transaction }
      );

      await serviceRecordItemRepository.bulkCreate(
        services.map((service) => ({
          service_record_id: record.id,
          service_id: service.id,
          service_name: service.service_name,
          price: service.price,
          reward_points: service.reward_points
        })),
        { transaction }
      );

      let walletBalance = wallet.current_balance;

      if (pointsToRedeem > 0) {
        walletBalance -= pointsToRedeem;
        await rewardWalletRepository.updateBalance(wallet.id, walletBalance, { transaction });
        await rewardTransactionRepository.create(
          {
            wallet_id: wallet.id,
            service_record_id: record.id,
            type: "redeemed",
            points: pointsToRedeem,
            note: "Points used on service invoice"
          },
          { transaction }
        );
      }

      walletBalance += pointsEarned;
      await rewardWalletRepository.updateBalance(wallet.id, walletBalance, { transaction });
      await rewardTransactionRepository.create(
        {
          wallet_id: wallet.id,
          service_record_id: record.id,
          type: "earned",
          points: pointsEarned,
          note: "Points earned from service record"
        },
        { transaction }
      );

      const serviceDate = record.service_date || new Date();
      const serviceReminders = services
        .filter((service) => Number(service.reminder_months) > 0)
        .map((service) => ({
          scso_user_id: scsoUserId,
          customer_id: payload.customerId,
          service_record_id: record.id,
          reminder_type: service.service_name,
          message: `${service.service_name} is due soon. Last service date: ${new Date(serviceDate).toLocaleDateString("en-IN")}.`,
          scheduled_at: buildServiceReminderDate(serviceDate, service.reminder_months),
          status: "pending"
        }));

      if (payload.reminderDate) {
        serviceReminders.push({
          scso_user_id: scsoUserId,
          customer_id: payload.customerId,
          service_record_id: record.id,
          reminder_type: payload.reminderType || "Next service reminder",
          message: payload.reminderMessage || "Your next bike service is due soon. Visit us again at BikeXpert.",
          scheduled_at: payload.reminderDate,
          status: "pending"
        });
      }

      if (serviceReminders.length) {
        await Promise.all(serviceReminders.map((reminder) => reminderRepository.create(reminder, { transaction })));
      }

      const shop = await scsoUserRepository.findShopInfo(scsoUserId, { transaction });
      const invoiceNumber = createInvoiceNumber(record.id);
      const invoiceSummary = `${invoiceNumber}\nCustomer: ${customer.full_name}\nBike: ${bike.bike_model} (${bike.bike_number})\nAmount: INR ${finalAmount}\nPoints Earned: ${pointsEarned}\nThank you for choosing ${shop.shop_name}.`;
      const whatsappShareLink = buildWhatsappLink(customer.whatsapp_number || customer.phone_number, invoiceSummary);

      await invoiceRepository.create(
        {
          service_record_id: record.id,
          invoice_number: invoiceNumber,
          shop_name: shop.shop_name,
          shop_address: shop.shop_address || "",
          shop_phone: shop.phone || "",
          customer_name: customer.full_name,
          customer_phone: customer.phone_number,
          whatsapp_number: customer.whatsapp_number || "",
          bike_model: bike.bike_model,
          bike_number: bike.bike_number,
          subtotal,
          discount_amount: discountAmount,
          final_total: finalAmount,
          points_earned: pointsEarned,
          points_used: pointsToRedeem,
          whatsapp_share_link: whatsappShareLink
        },
        { transaction }
      );

      return record.id;
    });
  },

  async listServiceRecords(scsoUserId, filters = {}) {
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);
    const [pagedRecords, filteredRecords] = await Promise.all([
      serviceRecordRepository.listForScso(scsoUserId, { ...filters, page, limit }),
      serviceRecordRepository.listForScso(scsoUserId, filters)
    ]);
    const customerVisitCounts = filteredRecords.reduce((counts, record) => {
      const customerId = record.customer_id;
      counts[customerId] = (counts[customerId] || 0) + 1;
      return counts;
    }, {});
    const uniqueCustomerVisitCounts = Object.values(customerVisitCounts);
    const total = pagedRecords.count || 0;

    const mapRecord = (record) => ({
      id: record.id,
      serviceDate: record.service_date,
      totalAmount: Number(record.total_amount),
      discountAmount: Number(record.discount_amount),
      finalAmount: Number(record.final_amount),
      pointsEarned: record.points_earned,
      pointsUsed: record.points_used,
      customerName: record.customer?.full_name,
      bikeModel: record.bike?.bike_model,
      bikeNumber: record.bike?.bike_number,
      invoiceId: record.invoice?.id || null
    });

    return {
      items: pagedRecords.rows.map(mapRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      },
      summary: {
        totalSales: filteredRecords.reduce((sum, record) => sum + Number(record.final_amount || 0), 0),
        totalJobCards: filteredRecords.length,
        newCustomers: uniqueCustomerVisitCounts.filter((count) => count === 1).length,
        oldCustomers: uniqueCustomerVisitCounts.filter((count) => count > 1).length
      }
    };
  },

  async getServiceRecordDetail(scsoUserId, recordId) {
    const record = await serviceRecordRepository.findDetailForScso(scsoUserId, recordId);

    if (!record) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Service record not found");
    }

    const [items, invoice] = await Promise.all([
      serviceRecordItemRepository.findByServiceRecordId(recordId),
      invoiceRepository.findByServiceRecordId(recordId)
    ]);

    return {
      id: record.id,
      serviceDate: record.service_date,
      serviceNotes: record.service_notes,
      totalAmount: Number(record.total_amount),
      discountAmount: Number(record.discount_amount),
      finalAmount: Number(record.final_amount),
      pointsEarned: record.points_earned,
      pointsUsed: record.points_used,
      customerName: record.customer?.full_name,
      phoneNumber: record.customer?.phone_number,
      whatsappNumber: record.customer?.whatsapp_number,
      bikeModel: record.bike?.bike_model,
      bikeNumber: record.bike?.bike_number,
      items: items.map((item) => ({
        id: item.id,
        serviceId: item.service_id,
        serviceName: item.service_name,
        price: Number(item.price),
        rewardPoints: item.reward_points
      })),
      invoice: invoice
        ? {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            whatsappShareLink: invoice.whatsapp_share_link
          }
        : null
    };
  },

  async getScsoDashboard(scsoUserId) {
    const [totalCustomers, totalServices, totalReminders, totalBills, totalRewardPointsIssued, recentCustomers, recentServiceHistory, chartData] =
      await Promise.all([
        customerRepository.countForScso(scsoUserId),
        serviceRepository.countForScso(scsoUserId),
        reminderRepository.countForScso(scsoUserId),
        invoiceRepository.countForScso(scsoUserId),
        serviceRecordRepository.sumRewardPointsForScso(scsoUserId),
        customerRepository.findRecentForScso(scsoUserId, 5),
        serviceRecordRepository.findRecentForScso(scsoUserId, 5),
        serviceRecordRepository.findChartDataForScso(scsoUserId)
      ]);

    return {
      counts: {
        totalCustomers,
        totalServices,
        totalReminders,
        totalBills,
        totalRewardPointsIssued: Number(totalRewardPointsIssued || 0)
      },
      recentCustomers: recentCustomers.map((customer) => ({
        id: customer.id,
        fullName: customer.full_name,
        phoneNumber: customer.phone_number,
        createdAt: customer.created_at
      })),
      recentServiceHistory: recentServiceHistory.map((record) => ({
        id: record.id,
        serviceDate: record.service_date,
        finalAmount: Number(record.final_amount),
        customerName: record.customer?.full_name
      })),
      chartData: chartData
        .map((item) => ({
          month: item.month,
          totalServices: Number(item.totalServices),
          revenue: Number(item.revenue || 0)
        }))
        .reverse()
    };
  }
};

export default recordService;
