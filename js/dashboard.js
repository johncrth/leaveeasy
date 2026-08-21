// ─────────────────────────────────────────────────────────────
// js/dashboard.js — หน้าที่ 5 แดชบอร์ดสรุป
// สัปดาห์ที่ 7: นับจากข้อมูลจริงใน Firestore
// ⚠️ ตัวเลขต้องนับจากข้อมูลจริงเสมอ ห้ามพิมพ์ตัวเลขค้างไว้ในโค้ด
// ─────────────────────────────────────────────────────────────

import { db, hasConfig, collection, getDocs, query, where } from "./firebase.js";
import { requireLogin } from "./auth.js";

const สถานะทั้งหมด = ["รอพิจารณา", "อนุมัติ", "ไม่อนุมัติ"];
const กล่องตัวเลข = document.getElementById("กล่องตัวเลข");
const ที่วางรายการ = document.getElementById("รายการล่าสุด");

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    showConfigWarning("จึงยังนับตัวเลขจากฐานข้อมูลไม่ได้");
    return;
  }
  // ⏳ ต้องรอให้รู้สถานะล็อกอินก่อน แล้วค่อยอ่านข้อมูลจากฐานข้อมูล
  const ผู้ใช้ = await requireLogin();
  if (!ผู้ใช้) return;

  ที่วางรายการ.innerHTML = "<p>กำลังโหลดข้อมูล…</p>";

  // 🔒 ผู้ขอลานับเฉพาะใบของตัวเอง · ผู้อนุมัติและฝ่ายบุคคลนับทุกใบ
  const เห็นได้ทุกใบ = ผู้ใช้.role === "manager" || ผู้ใช้.role === "hr";
  if (!เห็นได้ทุกใบ) {
    document.querySelector(".subtitle").textContent =
      "ตัวเลขนับจากใบลาของคุณเท่านั้น · ผู้อนุมัติและฝ่ายบุคคลจะเห็นตัวเลขของทั้งระบบ";
  }

  try {
    const คำถาม = เห็นได้ทุกใบ
      ? collection(db, "leaveRequests")
      : query(collection(db, "leaveRequests"), where("requesterId", "==", ผู้ใช้.uid));
    const ผล = await getDocs(คำถาม);
    const ใบลาทั้งหมด = ผล.docs.map((f) => ({ id: f.id, ...f.data() }));
    วาดตัวเลข(ใบลาทั้งหมด);
    วาดรายการล่าสุด(ใบลาทั้งหมด);
  } catch (e) {
    ที่วางรายการ.innerHTML =
      '<div class="alert alert-error">❌ อ่านข้อมูลไม่สำเร็จ — ' + esc(แปลข้อผิดพลาด(e)) + "</div>";
  }
}

function วาดตัวเลข(รายการ) {
  กล่องตัวเลข.innerHTML = สถานะทั้งหมด.map((สถานะ) => {
    const จำนวน = รายการ.filter((ใบ) => ใบ.status === สถานะ).length;
    // กดกล่องตัวเลข แล้วไปหน้ารายการที่กรองสถานะนั้นไว้
    return '<a class="stat" href="leave-requests.html?status=' + encodeURIComponent(สถานะ) + '">' +
           '<div class="number">' + จำนวน + "</div>" +
           "<div>" + ป้ายสถานะ(สถานะ) + "</div></a>";
  }).join("");
}

function วาดรายการล่าสุด(รายการ) {
  const ล่าสุด = รายการ
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))   // ใหม่ไปเก่า
    .slice(0, 5);

  if (ล่าสุด.length === 0) {
    ที่วางรายการ.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
    return;
  }

  ที่วางรายการ.innerHTML =
    "<table><thead><tr><th>หัวข้อ</th><th>ผู้ขอลา</th><th>สถานะ</th></tr></thead><tbody>" +
    ล่าสุด.map((ใบ) =>
      '<tr class="clickable" data-id="' + esc(ใบ.id) + '"><td>' + esc(ใบ.title) +
      "</td><td>" + esc(ใบ.requesterName) + "</td><td>" + ป้ายสถานะ(ใบ.status) + "</td></tr>"
    ).join("") +
    "</tbody></table>";

  ที่วางรายการ.querySelectorAll("tr.clickable").forEach((แถว) => {
    แถว.addEventListener("click", () => {
      location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
    });
  });
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธการอ่าน · ตรวจว่าล็อกอินแล้วหรือยัง";
  }
  return (e && e.message) || String(e);
}
