import contactMessageRepository from "../repositories/contactMessage.repository.js";
import settingService from "./settingService.js";

const publicService = {
  async submitContactMessage({ name, email, phone, message }) {
    await contactMessageRepository.create({
      name,
      email,
      phone: phone || null,
      message
    });
  },

  async getPublicBootstrap() {
    const settings = await settingService.getPublicSettings();

    return {
      mapIframeUrl: settings.mapIframeUrl,
      testimonials: [
        {
          id: 1,
          name: "Rakesh Verma",
          shop: "Verma Auto Garage",
          message: "BikeXpert helped us track repeat customers and service reminders without any confusion."
        },
        {
          id: 2,
          name: "Imran Shaikh",
          shop: "Speed Care Motors",
          message: "Billing and wallet points made our service desk much more professional for customers."
        },
        {
          id: 3,
          name: "Amit Patel",
          shop: "Patel Two Wheeler Works",
          message: "We now have customer history, reminders, and WhatsApp bills in one place. It saves us time every day."
        }
      ]
    };
  }
};

export default publicService;
