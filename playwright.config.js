// ─────────────────────────────────────────────────────────────
// playwright.config.js — ค่าตั้งค่าของการทดสอบอัตโนมัติ
//
// ค่าเริ่มต้นจะเปิดเว็บในเครื่องด้วย npm run dev ให้เอง
// ถ้าอยากทดสอบกับ URL ที่ deploy แล้ว ให้ตั้งค่า BASE_URL ก่อนสั่งรัน
// วิธีรันทั้งหมดอยู่ใน tests/README.md
// ─────────────────────────────────────────────────────────────

const { defineConfig, devices } = require("@playwright/test");

const ที่อยู่เว็บ = process.env.BASE_URL || "http://localhost:3000";

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60 * 1000,
  expect: { timeout: 10 * 1000 },
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: ที่อยู่เว็บ,
    locale: "th-TH",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },

  // ถ้าไม่ได้ตั้ง BASE_URL ไว้ ให้เปิดเซิร์ฟเวอร์ในเครื่องให้อัตโนมัติ
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60 * 1000
      },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
