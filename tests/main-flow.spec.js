// ─────────────────────────────────────────────────────────────
// tests/main-flow.spec.js — เส้นทางหลักของระบบ
// ยื่นใบลา → ใบใหม่โผล่ในหน้ารายการ → เปิดดูรายละเอียดได้
//
// ตรงกับเกณฑ์การยอมรับของ US-01 US-02 และ US-03
// ─────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");
const { บัญชีก, ตั้งค่าครบ, ล็อกอิน } = require("./helpers");

test.describe("เส้นทางหลัก — ยื่นใบลาแล้วเห็นในระบบ", () => {

  test.beforeEach(async ({ page }) => {
    test.skip(!ตั้งค่าครบ(บัญชีก), "ยังไม่ได้ตั้งค่าบัญชีทดสอบ TEST_EMAIL_A และ TEST_PASSWORD_A");
    await ล็อกอิน(page, บัญชีก);
  });

  test("ยื่นใบลาใหม่แล้วใบนั้นโผล่ในหน้ารายการ", async ({ page }) => {
    // ใส่เวลาไว้ในหัวข้อ จะได้แยกออกว่าเป็นใบที่เทสต์รอบนี้สร้าง
    const หัวข้อ = "ทดสอบอัตโนมัติ " + Date.now();

    await page.goto("new-leave-request.html");
    await page.locator("#title").fill(หัวข้อ);
    await page.locator("#reason").fill("ใบลาที่สร้างโดยการทดสอบอัตโนมัติ");
    await page.locator("#leaveTypeId").selectOption({ index: 1 });
    await page.locator("#startDate").fill("2026-09-07");
    await page.locator("#endDate").fill("2026-09-09");
    await page.getByRole("button", { name: "บันทึก" }).click();

    // บันทึกแล้วต้องพากลับไปหน้ารายการเอง
    await page.waitForURL("**/leave-requests.html");

    // ใบใหม่ต้องอยู่ในตาราง พร้อมสถานะ รอพิจารณา
    const แถว = page.locator("tr", { hasText: หัวข้อ });
    await expect(แถว).toBeVisible();
    await expect(แถว).toContainText("รอพิจารณา");

    // กดที่แถว แล้วต้องไปหน้ารายละเอียดที่แสดงข้อมูลครบ
    await แถว.click();
    await page.waitForURL("**/leave-request-detail.html?id=*");
    await expect(page.locator("#กล่องใบลา")).toContainText(หัวข้อ);
    await expect(page.locator("#กล่องใบลา")).toContainText("รอพิจารณา");
  });

  test("หน้ารายการแสดงคอลัมน์ครบตามที่ออกแบบไว้", async ({ page }) => {
    await page.goto("leave-requests.html");
    for (const หัวคอลัมน์ of ["หัวข้อ", "ประเภทการลา", "สถานะ"]) {
      await expect(page.locator("th", { hasText: หัวคอลัมน์ }).first()).toBeVisible();
    }
  });
});
