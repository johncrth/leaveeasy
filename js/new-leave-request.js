// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: บันทึกลง Firestore จริง (ตัว C ของ CRUD)
// ─────────────────────────────────────────────────────────────

import { db, hasConfig, collection, getDocs, addDoc } from "./firebase.js";
import { requireLogin } from "./auth.js";

const ฟอร์ม = document.getElementById("ฟอร์มใบลา");
const ช่องประเภท = document.getElementById("leaveTypeId");
const กล่องเตือน = document.getElementById("ข้อความเตือน");
const ปุ่มบันทึก = document.getElementById("ปุ่มบันทึก");

// ผู้ยื่นใบลา = คนที่ล็อกอินอยู่จริง (เติมค่าตอนเริ่มทำงาน)
let ผู้ใช้ปัจจุบัน = null;

let ประเภททั้งหมด = [];

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    showConfigWarning("จึงยังบันทึกใบลาลงฐานข้อมูลไม่ได้");
    ปุ่มบันทึก.disabled = true;
    return;
  }
  // ⏳ ต้องรอให้รู้สถานะล็อกอินก่อน แล้วค่อยอ่านข้อมูลจากฐานข้อมูล
  ผู้ใช้ปัจจุบัน = await requireLogin();
  if (!ผู้ใช้ปัจจุบัน) return;

  await โหลดประเภทการลา();
  ฟอร์ม.addEventListener("submit", บันทึกใบลา);
}

// ── อ่านประเภทการลาจากโฟลเดอร์ leaveTypes มาใส่รายการเลื่อนลง ──
async function โหลดประเภทการลา() {
  try {
    const ผล = await getDocs(collection(db, "leaveTypes"));
    ประเภททั้งหมด = ผล.docs.map((ไฟล์) => ({ id: ไฟล์.id, ...ไฟล์.data() }));

    ประเภททั้งหมด.forEach((ประเภท) => {
      const ตัวเลือก = document.createElement("option");
      ตัวเลือก.value = ประเภท.id;
      ตัวเลือก.textContent = ประเภท.name;
      ช่องประเภท.appendChild(ตัวเลือก);
    });

    if (ประเภททั้งหมด.length === 0) {
      เตือน("ยังไม่มีประเภทการลาในระบบ — ไปเพิ่มที่หน้าจัดการประเภทการลาก่อน");
    }
  } catch (e) {
    เตือน("อ่านประเภทการลาไม่สำเร็จ — " + แปลข้อผิดพลาด(e));
  }
}

// ── บันทึกใบลาใหม่ลง Firestore ──
async function บันทึกใบลา(e) {
  e.preventDefault();

  const ค่า = {
    title: document.getElementById("title").value.trim(),
    reason: document.getElementById("reason").value.trim(),
    leaveTypeId: ช่องประเภท.value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value
  };

  // ตรวจว่ากรอกครบก่อนบันทึก
  if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
    เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
    return;
  }
  if (ค่า.endDate < ค่า.startDate) {
    เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
    return;
  }

  const ประเภท = ประเภททั้งหมด.find((t) => t.id === ค่า.leaveTypeId);

  ปุ่มบันทึก.disabled = true;
  ปุ่มบันทึก.textContent = "กำลังบันทึก…";

  try {
    await addDoc(collection(db, "leaveRequests"), {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                    // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: ผู้ใช้ปัจจุบัน.uid,
      requesterName: ผู้ใช้ปัจจุบัน.name,      // 🔁 จดชื่อซ้ำไว้ เพราะ Firestore ไม่มี JOIN
      approverId: "",                          // ยังไม่ได้กำหนดผู้อนุมัติ
      approverName: "",
      leaveTypeId: ประเภท.id,
      leaveTypeName: ประเภท.name,              // 🔁 จดชื่อซ้ำไว้เช่นกัน
      startDate: ค่า.startDate,
      endDate: ค่า.endDate,
      createdAt: เวลาตอนนี้()
    });
    location.href = "leave-requests.html";
  } catch (err) {
    เตือน("บันทึกไม่สำเร็จ — " + แปลข้อผิดพลาด(err));
    ปุ่มบันทึก.disabled = false;
    ปุ่มบันทึก.textContent = "บันทึก";
  }
}

function เตือน(ข้อความ) {
  กล่องเตือน.textContent = "⚠️ " + ข้อความ;
  กล่องเตือน.classList.remove("hidden");
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธ · ตรวจว่าล็อกอินแล้วหรือยัง และกฎใน firestore.rules deploy ขึ้นไปแล้วหรือยัง";
  }
  return (e && e.message) || String(e);
}
