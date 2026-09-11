
import { Decimal } from "@prisma/client/runtime/library";

function convertPriceToPaise(price: Decimal): number {
  if (price.lessThanOrEqualTo(0)) throw new Error("Invalid price: must be > 0");
  return Number(price.mul(100).toFixed(0));
}

const tests = [
  { input: "1.00", expected: 100 },
  { input: "1.01", expected: 101 },
  { input: "10.50", expected: 1050 },
  { input: "1999.00", expected: 199900 },
  { input: "1999.99", expected: 199999 },
];

for (const test of tests) {
  const result = convertPriceToPaise(new Decimal(test.input));
  console.log(`Input: ${test.input}, Expected: ${test.expected}, Got: ${result}, Passed: ${result === test.expected}`);
  if (result !== test.expected) process.exit(1);
}
console.log("All tests passed!");
