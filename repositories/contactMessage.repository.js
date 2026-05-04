import { ContactMessage } from "../models/index.js";

const contactMessageRepository = {
  create(payload, options = {}) {
    return ContactMessage.create(payload, options);
  }
};

export default contactMessageRepository;
