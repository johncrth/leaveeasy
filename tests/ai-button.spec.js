// ─────────────────────────────────────────────────────────────
// tests/ai-button.spec.js — ปุ่มผู้ช่วย AI ล้มแล้วระบบต้องไม่ค้าง
//
// วิธีทดสอบ: ตัดการเชื่อมต่อไปยัง OpenRouter ทิ้งกลางทาง
// เหมือนปิดเน็ตตอนกดปุ่ม แต่ทำได้ซ้ำ ๆ อัตโนมัติ
// ─────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");
const { บัญชีก, ตั้งค่าครบ, ล็อกอิน } = require("./helpers");

test.describe("ปุ่มผู้ช่วย AI", () => {

  test.beforeEach(async ({ page }) => {
    test.skip(!ตั้งค่าครบ(บัญชีก), "ยังไม่ได้ตั้งค่าบัญชีทดสอบ TEST_EMAIL_A และ TEST_PASSWORD_A");
    await ล็อกอิน(page, บัญชีก);
  });

  test("เรียก AI ไม่สำเร็จ ต้องขึ้นข้อความภาษาไทย และยังบันทึกใบลาเองได้", async ({ page }) => {
    // ทำให้ทุกคำขอที่ส่งไป OpenRouter ล้มเหลว
    await page.route("**openrouter.ai/**", (route) => route.abort());

    await page.goto("new-leave-request.html");
    await page.locator("#reason").fill("มีไข้สูง แพทย์ให้พักสองวัน");

    const ปุ่มAI = page.getByRole("button", { name: /ให้ AI ช่วยจัดประเภทการลา/ });
    test.skip(await ปุ่มAI.isDisabled(), "ยังไม่ได้ใส่คีย์ AI ในไฟล์ js/config.js");

    await ปุ่มAI.click();

    // ต้องมีข้อความภาษาไทยบอกว่าเรียกไม่สำเร็จ
    await expect(page.locator("#ผลจากAI")).toContainText("เรียก AI ไม่สำเร็จ", { timeout: 25000 });

    // ปุ่มต้องกลับมากดได้ ไม่ค้างอยู่ที่ กำลังทำงาน
    await expect(ปุ่มAI).toBeEnabled();

    // และที่สำคัญที่สุด — ยังกรอกเองแล้วบันทึกใบลาได้ตามปกติ
    const หัวข้อ = "ทดสอบตอน AI ล้ม " + Date.now();
    await page.locator("#title").fill(หัวข้อ);
    await page.locator("#leaveTypeId").selectOption({ index: 1 });
    await page.locator("#startDate").fill("2026-09-07");
    await page.locator("#endDate").fill("2026-09-08");
    await page.getByRole("button", { name: "บันทึก" }).click();

    await page.waitForURL("**/leave-requests.html");
    await expect(page.locator("tr", { hasText: หัวข้อ })).toBeVisible();
  });

  test("ยังไม่พิมพ์เหตุผล กดปุ่ม AI ต้องบอกให้พิมพ์ก่อน", async ({ page }) => {
    await page.goto("new-leave-request.html");

    const ปุ่มAI = page.getByRole("button", { name: /ให้ AI ช่วยจัดประเภทการลา/ });
    test.skip(await ปุ่มAI.isDisabled(), "ยังไม่ได้ใส่คีย์ AI ในไฟล์ js/config.js");

    await ปุ่มAI.click();
    await expect(page.locator("#ผลจากAI")).toContainText("พิมพ์เหตุผลการลาก่อน");
  });
});
