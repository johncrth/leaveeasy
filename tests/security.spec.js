// ─────────────────────────────────────────────────────────────
// tests/security.spec.js — ทดสอบความปลอดภัยแบบสวมรอย
//
// 🔒 นี่คือเทสต์ที่สำคัญที่สุดของชุดนี้
// ดูหน้าจอของตัวเองอย่างเดียวไม่พอ ต้องลองเป็นคนอื่นแล้วดูว่าเข้าถึงได้ไหม
//
// ⚠️ ถ้าเทสต์ในไฟล์นี้ไม่ผ่าน แปลว่าข้อมูลรั่วจริง ห้ามแก้เทสต์ให้ผ่าน ให้ไปแก้กฎ
// ─────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");
const { บัญชีก, บัญชีข, ตั้งค่าครบ, ล็อกอิน } = require("./helpers");

test.describe("ความปลอดภัย", () => {

  test("คนที่ไม่ล็อกอิน เปิดหน้ารายการไม่ได้ ต้องถูกส่งไปหน้าเข้าสู่ระบบ", async ({ page }) => {
    await page.goto("leave-requests.html");
    await page.waitForURL("**/login.html", { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();
  });

  test("คนที่ไม่ล็อกอิน เปิดหน้ารายละเอียดใบลาตรง ๆ ก็ไม่ได้", async ({ page }) => {
    await page.goto("leave-request-detail.html?id=lr001");
    await page.waitForURL("**/login.html", { timeout: 20000 });
  });

  test("สวมรอย — ล็อกอินเป็นพนักงาน ข. แล้วเปิดใบลาของพนักงาน ก. ต้องไม่ได้", async ({ page }) => {
    test.skip(
      !ตั้งค่าครบ(บัญชีก) || !ตั้งค่าครบ(บัญชีข) || !process.env.TEST_REQUEST_ID_A,
      "ต้องตั้งค่าบัญชีทดสอบทั้งสองบัญชี และ TEST_REQUEST_ID_A (รหัสใบลาของพนักงาน ก.)"
    );

    // ล็อกอินเป็นพนักงาน ข. ซึ่งเป็นคนละคนกับเจ้าของใบลา
    await ล็อกอิน(page, บัญชีข);

    // แล้วพยายามเปิด URL ของใบลาที่เป็นของพนักงาน ก. ตรง ๆ
    await page.goto("leave-request-detail.html?id=" + process.env.TEST_REQUEST_ID_A);

    // ต้องไม่เห็นเนื้อหาใบลา ต้องเห็นข้อความว่าเปิดไม่ได้แทน
    const กล่อง = page.locator("#กล่องใบลา");
    await expect(กล่อง).toContainText(/ไม่พบใบขอลา|ปฏิเสธ|อ่านข้อมูลไม่สำเร็จ/);
  });

  test("พนักงานทั่วไปเห็นเฉพาะใบลาของตัวเองในหน้ารายการ", async ({ page }) => {
    test.skip(!ตั้งค่าครบ(บัญชีข), "ยังไม่ได้ตั้งค่าบัญชีทดสอบ TEST_EMAIL_B และ TEST_PASSWORD_B");

    await ล็อกอิน(page, บัญชีข);
    await expect(page.locator(".subtitle")).toContainText("เฉพาะใบลาของคุณ");
  });
});
