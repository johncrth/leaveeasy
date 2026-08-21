// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 7: อ่านจาก Firestore · เปลี่ยนสถานะจริง · เขียนความเห็นลงโฟลเดอร์ย่อย approvals
// ─────────────────────────────────────────────────────────────

import {
  db, hasConfig, doc, getDoc, updateDoc,
  collection, getDocs, addDoc
} from "./firebase.js";

const รหัสใบลา = ค่าจากURL("id");
const กล่องใบลา = document.getElementById("กล่องใบลา");
const กล่องความเห็น = document.getElementById("กล่องความเห็น");

// ผู้ที่กำลังใช้งาน — สัปดาห์นี้ทำ CRUD ก่อน ล็อกอินตามมาทีหลัง
let ผู้ใช้ปัจจุบัน = { uid: "u002", name: "สมหญิง รักงาน" };

let ใบ = null;          // ข้อมูลใบลาใบนี้
let ความเห็น = [];      // รายการในโฟลเดอร์ย่อย approvals

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    showConfigWarning("จึงยังเปิดดูรายละเอียดใบลาจากฐานข้อมูลไม่ได้");
    กล่องใบลา.innerHTML = "";
    return;
  }
  if (!รหัสใบลา) {
    กล่องใบลา.innerHTML = "<p>ไม่ได้ระบุว่าจะเปิดใบไหน — กลับไปเลือกจากหน้ารายการ</p>";
    return;
  }
  await โหลดใบลา();
}

// ── อ่านใบลาและความเห็นทั้งหมดของใบนี้ ──
async function โหลดใบลา() {
  try {
    const ไฟล์ = await getDoc(doc(db, "leaveRequests", รหัสใบลา));
    if (!ไฟล์.exists()) {
      กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
      return;
    }
    ใบ = { id: ไฟล์.id, ...ไฟล์.data() };

    // โฟลเดอร์ย่อย approvals ซ้อนอยู่ในไฟล์ใบลาใบนี้
    const ผล = await getDocs(collection(db, "leaveRequests", รหัสใบลา, "approvals"));
    ความเห็น = ผล.docs.map((f) => ({ id: f.id, ...f.data() }));

    วาดใบลา();
    วาดความเห็น();
    กล่องความเห็น.classList.remove("hidden");
    document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
  } catch (e) {
    กล่องใบลา.innerHTML =
      '<div class="alert alert-error">❌ อ่านข้อมูลไม่สำเร็จ — ' + esc(แปลข้อผิดพลาด(e)) + "</div>";
  }
}

// ── วาดข้อมูลใบลาลงหน้าจอ ──
function วาดใบลา() {
  const แถว = [
    ["หัวข้อ", esc(ใบ.title)],
    ["เหตุผลการลา", esc(ใบ.reason)],
    ["ประเภทการลา", esc(ใบ.leaveTypeName)],
    ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
    ["ผู้ขอลา", esc(ใบ.requesterName)],
    ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
    ["สถานะ", ป้ายสถานะ(ใบ.status)],
    ["วันที่ยื่น", esc(ใบ.createdAt)]
  ];

  let html = แถว.map((r) =>
    '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>"
  ).join("");

  // ปุ่มอนุมัติ / ไม่อนุมัติ ขึ้นเฉพาะใบที่ยังรอพิจารณา
  if (ใบ.status === "รอพิจารณา") {
    html +=
      '<div class="btn-row">' +
      '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
      '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>' +
      "</div>";
  } else {
    html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
  }
  html += '<div id="เตือนสถานะ" class="alert alert-error hidden"></div>';

  กล่องใบลา.innerHTML = html;

  if (ใบ.status === "รอพิจารณา") {
    document.getElementById("ปุ่มอนุมัติ")
      .addEventListener("click", () => เปลี่ยนสถานะ("อนุมัติ"));
    document.getElementById("ปุ่มไม่อนุมัติ")
      .addEventListener("click", () => เปลี่ยนสถานะ("ไม่อนุมัติ"));
  }
}

// ── เปลี่ยนสถานะจริงในฐานข้อมูล ──
async function เปลี่ยนสถานะ(สถานะใหม่) {
  const เตือน = document.getElementById("เตือนสถานะ");

  // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
  if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
    เตือน.textContent = "⚠️ ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้";
    เตือน.classList.remove("hidden");
    return;
  }

  try {
    // ⚠️ แก้เฉพาะช่อง status เท่านั้น ห้ามเขียนทับช่องอื่นในไฟล์เดิม
    await updateDoc(doc(db, "leaveRequests", ใบ.id), { status: สถานะใหม่ });
    ใบ.status = สถานะใหม่;
    วาดใบลา();
  } catch (e) {
    เตือน.textContent = "❌ เปลี่ยนสถานะไม่สำเร็จ — " + แปลข้อผิดพลาด(e);
    เตือน.classList.remove("hidden");
  }
}

// ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
function วาดความเห็น() {
  const ที่วาง = document.getElementById("รายการความเห็น");
  if (ความเห็น.length === 0) {
    ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
    return;
  }
  ที่วาง.innerHTML = ความเห็น
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map((c) =>
      '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
      "</div><div>" + esc(c.message) + "</div></div>"
    ).join("");
}

// ── ส่งความเห็นใหม่ลงโฟลเดอร์ย่อย approvals ──
async function ส่งความเห็น() {
  const ช่อง = document.getElementById("ข้อความความเห็น");
  const เตือน = document.getElementById("เตือนความเห็น");
  const ปุ่ม = document.getElementById("ปุ่มส่งความเห็น");
  const ข้อความ = ช่อง.value.trim();

  if (!ข้อความ) {
    เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
    เตือน.classList.remove("hidden");
    return;
  }
  เตือน.classList.add("hidden");

  const ความเห็นใหม่ = {
    authorId: ผู้ใช้ปัจจุบัน.uid,
    authorName: ผู้ใช้ปัจจุบัน.name,     // 🔁 จดชื่อซ้ำไว้ จะได้ไม่ต้องเปิดโฟลเดอร์ users
    message: ข้อความ,
    createdAt: เวลาตอนนี้()
  };

  ปุ่ม.disabled = true;
  ปุ่ม.textContent = "กำลังส่ง…";
  try {
    const ไฟล์ใหม่ = await addDoc(
      collection(db, "leaveRequests", ใบ.id, "approvals"), ความเห็นใหม่
    );
    ความเห็น.push({ id: ไฟล์ใหม่.id, ...ความเห็นใหม่ });
    ช่อง.value = "";
    วาดความเห็น();
  } catch (e) {
    เตือน.textContent = "❌ ส่งความเห็นไม่สำเร็จ — " + แปลข้อผิดพลาด(e);
    เตือน.classList.remove("hidden");
  } finally {
    ปุ่ม.disabled = false;
    ปุ่ม.textContent = "ส่งความเห็น";
  }
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธ · ตรวจว่าล็อกอินแล้วหรือยัง และมีสิทธิ์ทำสิ่งนี้หรือไม่";
  }
  return (e && e.message) || String(e);
}
