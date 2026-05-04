import { StatusCodes } from "http-status-codes";
import invoiceRepository from "../repositories/invoice.repository.js";
import ApiError from "../utils/apiError.js";

const invoiceService = {
  async getInvoiceDetail(scsoUserId, invoiceId) {
    const invoice = await invoiceRepository.findDetailForScso(scsoUserId, invoiceId);

    if (!invoice) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      shopName: invoice.shop_name,
      shopAddress: invoice.shop_address,
      shopPhone: invoice.shop_phone,
      customerName: invoice.customer_name,
      customerPhone: invoice.customer_phone,
      whatsappNumber: invoice.whatsapp_number,
      bikeModel: invoice.bike_model,
      bikeNumber: invoice.bike_number,
      subtotal: Number(invoice.subtotal),
      discountAmount: Number(invoice.discount_amount),
      finalTotal: Number(invoice.final_total),
      pointsEarned: invoice.points_earned,
      pointsUsed: invoice.points_used,
      whatsappShareLink: invoice.whatsapp_share_link,
      createdAt: invoice.created_at,
      serviceRecordId: invoice.service_record?.id,
      items:
        invoice.service_record?.items?.map((item) => ({
          serviceName: item.service_name,
          price: Number(item.price),
          rewardPoints: item.reward_points
        })) || []
    };
  }
};

export default invoiceService;
