import { z } from "zod";

export const sendMessageSchema = z.object({
  to: z.string().min(10, "Phone number is required").max(20),
  message: z.string().min(1, "Message cannot be empty").max(4096),
});

export const createContactSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required").max(20),
  name: z.string().max(100).optional(),
});

export const userParamSchema = z.object({
  user: z.string().min(10).max(20),
});
