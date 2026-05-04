import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import scsoUserRepository from "../repositories/scsoUser.repository.js";
import adminRepository from "../repositories/admin.repository.js";
import ApiError from "../utils/apiError.js";
import { signToken } from "../utils/jwt.js";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  shopName: user.shop_name,
  shopAddress: user.shop_address,
  whatsappNumber: user.whatsapp_number,
  role: user.role,
  status: user.status,
  createdAt: user.created_at
});

const authService = {
  async adminLogin({ email, password }) {
    const admin = await adminRepository.findByEmail(email);

    if (!admin) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
    }

    return {
      token: signToken({ id: admin.id, role: "admin" }),
      user: sanitizeUser(admin)
    };
  },

  async scsoLogin({ email, password }) {
    const user = await scsoUserRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    if (user.status !== "active") {
      throw new ApiError(StatusCodes.FORBIDDEN, "Account is inactive");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    return {
      token: signToken({ id: user.id, role: "scso" }),
      user: sanitizeUser(user)
    };
  },

  async scsoSignup({ name, email, phone, password, shopName, shopAddress, whatsappNumber }) {
    const existing = await scsoUserRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await scsoUserRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      shop_name: shopName,
      shop_address: shopAddress || null,
      whatsapp_number: whatsappNumber || null
    });

    return {
      token: signToken({ id: user.id, role: "scso" }),
      user: sanitizeUser(user)
    };
  }
};

export default authService;
