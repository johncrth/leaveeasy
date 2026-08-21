// ─────────────────────────────────────────────────────────────
// tests/validation.spec.js — กรอกไม่ครบแล้วต้องไม่บันทึก
//
// เทสต์ชุดนี้เช็คว่าระบบ "ปฏิเสธอย่างสุภาพ" ไม่ใช่บันทึกข้อมูลพัง ๆ ลงฐาน
// ─────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");
const { บัญชีก, ตั้งค่าครบ, ล็อกอิน } = require("./helpers");

test.describe("กรอกไม่ครบ ต้องเตือนและไม่บันทึก", () => {

  test.beforeEach(async ({ page }) => {
    test.skip(!ตั้งค่าครบ(บัญชีก), "ยังไม่ได้ตั้งค่าบัญชีทดสอบ TEST_EMAIL_A และ TEST_PASSWORD_A");
    await ล็อกอิน(page, บัญชีก);
  });

  test("กดบันทึกโดยไม่กรอกอะไรเลย ต้องขึ้นข้อความเตือน และยังอยู่หน้าเดิม", async ({ page }) => {
    await page.goto("new-leave-request.html");
    await page.getByRole("button", { name: "บันทึก" }).click();

    await expect(page.locator("#ข้อความเตือน")).toBeVisible();
    await expect(page.locator("#ข้อความเตือน")).toContainText("กรอกไม่ครบ");
    expect(page.url()).toContain("new-leave-request.html");
  });

  test("วันที่สิ้นสุดมาก่อนวันที่เริ่มลา ต้องเตือน", async ({ page }) => {
    await page.goto("new-leave-request.html");
    await page.locator("#title").fill("ทดสอบวันที่ย้อนหลัง");
    await page.locator("#reason").fill("ทดสอบว่าระบบตรวจวันที่หรือไม่");
    await page.locator("#leaveTypeId").selectOption({ index: 1 });
    await page.locator("#startDate").fill("2026-09-10");
    await page.locator("#endDate").fill("2026-09-01");
    await page.getByRole("button", { name: "บันทึก" }).click();

    await expect(page.locator("#ข้อความเตือน")).toContainText("วันที่สิ้นสุด");
  });

  test("ส่งความเห็นว่างเปล่าไม่ได้", async ({ page }) => {
    await page.goto("leave-requests.html");
    const แถวแรก = page.locator("tbody tr").first();
    await expect(แถวแรก).toBeVisible();
    await แถวแรก.click();
    await page.waitForURL("**/leave-request-detail.html?id=*");

    await page.getByRole("button", { name: "ส่งความเห็น" }).click();
    await expect(page.locator("#เตือนความเห็น")).toBeVisible();
  });
});
