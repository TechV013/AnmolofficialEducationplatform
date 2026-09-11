import Razorpay from "razorpay";
import { Decimal } from "@prisma/client/runtime/library";
import { convertPriceToPaise as convert } from "./money";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay configuration missing");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const convertPriceToPaise = convert;
