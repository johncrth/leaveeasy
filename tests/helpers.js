// ─────────────────────────────────────────────────────────────
// tests/helpers.js — ตัวช่วยที่ไฟล์ทดสอบทุกไฟล์เรียกใช้
// ─────────────────────────────────────────────────────────────

// บัญชีทดสอบ 2 บัญชี — ตั้งค่าผ่านตัวแปรสภาพแวดล้อมก่อนรัน (ดู tests/README.md)
// ⚠️ ห้ามเขียนอีเมลและรหัสผ่านจริงลงในไฟล์นี้ เพราะไฟล์นี้ถูก commit ขึ้น GitHub
const บัญชีก = {
  email: process.env.TEST_EMAIL_A || "",
  password: process.env.TEST_PASSWORD_A || ""
};

const บัญชีข = {
  email: process.env.TEST_EMAIL_B || "",
  password: process.env.TEST_PASSWORD_B || ""
};

// ตั้งค่าครบหรือยัง ถ้ายังให้ข้ามเทสต์นั้นแทนที่จะรายงานว่าสอบตก
function ตั้งค่าครบ(บัญชี) {
  return Boolean(บัญชี.email && บัญชี.password);
}

// เข้าสู่ระบบด้วยบัญชีที่ระบุ แล้วรอจนถึงหน้ารายการใบลา
async function ล็อกอิน(page, บัญชี) {
  await page.goto("login.html");
  await page.locator("#อีเมลเข้า").fill(บัญชี.email);
  await page.locator("#รหัสผ่านเข้า").fill(บัญชี.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.waitForURL("**/leave-requests.html", { timeout: 20000 });
}

module.exports = { บัญชีก, บัญชีข, ตั้งค่าครบ, ล็อกอิน };
