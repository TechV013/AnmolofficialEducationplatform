import { Decimal } from "@prisma/client/runtime/library";

export const convertPriceToPaise = (price: Decimal): number => {
  if (price.lessThanOrEqualTo(0)) throw new Error("Invalid price: must be > 0");
  // Exact conversion using Decimal's methods, then convert to integer.
  // toFixed(0) rounds correctly for positive numbers.
  return Number(price.mul(100).toFixed(0));
};
