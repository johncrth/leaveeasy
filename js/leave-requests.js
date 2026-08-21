// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// สัปดาห์ที่ 6: อ่านข้อมูลจริงจาก Firestore แล้ว (ตัว R ของ CRUD)
// การเพิ่ม แก้ ลบ ลงฐานข้อมูล เป็นงานของสัปดาห์ที่ 7
// ─────────────────────────────────────────────────────────────

import { db, hasConfig, collection, getDocs, query, where } from "./firebase.js";
import { requireLogin } from "./auth.js";

const กล่อง = document.getElementById("ผลลัพธ์");

// ถ้ามาจากการกดกล่องตัวเลขบนแดชบอร์ด จะมีสถานะติดมาท้าย URL
const สถานะที่กรอง = ค่าจากURL("status");
if (สถานะที่กรอง) {
  document.querySelector(".subtitle").textContent =
    "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
}

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    // ยังไม่ได้ตั้งค่า Firebase — ขึ้นแถบเตือนสีเหลืองแทนการพังทั้งหน้า
    showConfigWarning("หน้านี้จึงยังไม่มีใบลาให้แสดง");
    กล่อง.innerHTML = "";
    return;
  }
  // ⏳ ต้องรอให้รู้สถานะล็อกอินก่อน แล้วค่อยอ่านข้อมูลจากฐานข้อมูล
  const ผู้ใช้ = await requireLogin();
  if (!ผู้ใช้) return;

  await โหลดจากฐานข้อมูล(ผู้ใช้);
}

// ── อ่านใบลาจากโฟลเดอร์ leaveRequests บน Firestore ──
// 🔒 ผู้ขอลาเห็นเฉพาะใบของตัวเอง · ผู้อนุมัติและฝ่ายบุคคลเห็นทุกใบ
// ต้องถามให้ตรงกับสิทธิ์ที่มี ไม่งั้นฐานข้อมูลจะปฏิเสธทั้งคำขอ
async function โหลดจากฐานข้อมูล(ผู้ใช้) {
  const เห็นได้ทุกใบ = ผู้ใช้.role === "manager" || ผู้ใช้.role === "hr";

  if (!เห็นได้ทุกใบ && !สถานะที่กรอง) {
    document.querySelector(".subtitle").textContent =
      "แสดงเฉพาะใบลาของคุณ · ผู้อนุมัติและฝ่ายบุคคลเท่านั้นที่เห็นใบลาของทุกคน";
  }

  try {
    const คำถาม = เห็นได้ทุกใบ
      ? collection(db, "leaveRequests")
      : query(collection(db, "leaveRequests"), where("requesterId", "==", ผู้ใช้.uid));
    const ผล = await getDocs(คำถาม);

    // แปลงจากไฟล์ของ Firestore เป็นรายการธรรมดา และจดชื่อไฟล์ไว้เป็น id
    const รายการ = ผล.docs.map((ไฟล์) => ({ id: ไฟล์.id, ...ไฟล์.data() }));

    // เรียงใหม่ไปเก่า โดยเรียงในเบราว์เซอร์ ไม่ต้องสร้าง index บน Firestore
    รายการ.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    แสดงตาราง(รายการ);
  } catch (e) {
    กล่อง.innerHTML =
      '<div class="alert alert-error">❌ อ่านข้อมูลไม่สำเร็จ — ' + esc(แปลข้อผิดพลาด(e)) + "</div>";
  }
}

function แสดงตาราง(รายการทั้งหมด) {
  const รายการ = สถานะที่กรอง
    ? รายการทั้งหมด.filter((ใบ) => ใบ.status === สถานะที่กรอง)
    : รายการทั้งหมด;

  if (รายการ.length === 0) {
    กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
    return;
  }

  let html =
    "<table><thead><tr>" +
    "<th>หัวข้อ</th>" +
    "<th>ประเภทการลา</th>" +
    "<th>สถานะ</th>" +
    '<th class="hide-mobile">ผู้ขอลา</th>' +
    '<th class="hide-mobile">วันที่ลา</th>' +
    "</tr></thead><tbody>";

  รายการ.forEach((ใบ) => {
    html +=
      '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
      "<td>" + esc(ใบ.title) + "</td>" +
      "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
      "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
      '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
      '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
      "</tr>";
  });

  html += "</tbody></table>";
  กล่อง.innerHTML = html;

  // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
  กล่อง.querySelectorAll("tr.clickable").forEach((แถว) => {
    แถว.addEventListener("click", () => {
      location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
    });
  });
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธการอ่าน · ตรวจว่ากฎใน firestore.rules เปิดให้อ่านหรือยัง";
  }
  return (e && e.message) || String(e);
}
