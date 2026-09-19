
const bcrypt = require("bcryptjs");

async function test() {
  const password = "password123";
  const hash = await bcrypt.hash(password, 12);
  const isValid = await bcrypt.compare(password, hash);
  console.log("Hashing and comparison successful:", isValid);
}
test();
