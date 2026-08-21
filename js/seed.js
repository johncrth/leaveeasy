// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างลง Firestore
//
// หน้านี้เก็บข้อมูลตัวอย่างไว้ในตัวเอง จะได้ใช้ได้ตลอด
// แม้จะลบไฟล์ข้อมูลปลอม js/data.js ทิ้งไปแล้วในสัปดาห์ที่ 7
//
// ⚠️ ชื่อคนทุกชื่อเป็นชื่อสมมติ · อีเมลทุกตัวเป็นอีเมลตัวอย่าง
// ─────────────────────────────────────────────────────────────

import { db, hasConfig, doc, setDoc } from "./firebase.js";
import { requireLogin } from "./auth.js";

// 📁 users — ผู้ใช้ 3 คน 3 บทบาท
const USERS = {
  u001: { name: "สมชาย ใจดี",   email: "somchai@example.com", role: "employee" },
  u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
  u003: { name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "hr" }
};

// 📁 leaveTypes — ประเภทการลา 3 แบบ
const LEAVE_TYPES = {
  lt001: { name: "ลาพักร้อน" },
  lt002: { name: "ลาป่วย" },
  lt003: { name: "ลากิจ" }
};

// 📁 leaveRequests — ใบขอลา 5 ใบ สถานะกระจายครบ 3 ค่า
const LEAVE_REQUESTS = {
  lr001: {
    title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
    reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
    status: "รอพิจารณา",
    requesterId: "u001", requesterName: "สมชาย ใจดี",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
    startDate: "2026-09-07", endDate: "2026-09-09",
    createdAt: "2026-09-01 09:15"
  },
  lr002: {
    title: "ลาป่วยไข้หวัดใหญ่",
    reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
    status: "อนุมัติ",
    requesterId: "u001", requesterName: "สมชาย ใจดี",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
    startDate: "2026-08-24", endDate: "2026-08-25",
    createdAt: "2026-08-24 08:05"
  },
  lr003: {
    title: "ลากิจไปทำบัตรประชาชน",
    reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
    status: "รอพิจารณา",
    requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
    approverId: "",      approverName: "",
    leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
    startDate: "2026-09-15", endDate: "2026-09-15",
    createdAt: "2026-09-10 16:30"
  },
  lr004: {
    title: "ลาพักร้อนช่วงวันหยุดยาว",
    reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
    status: "ไม่อนุมัติ",
    requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
    startDate: "2026-10-12", endDate: "2026-10-16",
    createdAt: "2026-09-20 11:00"
  },
  lr005: {
    title: "ลาป่วยไปพบแพทย์ตามนัด",
    reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
    status: "รอพิจารณา",
    requesterId: "u001", requesterName: "สมชาย ใจดี",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
    startDate: "2026-09-22", endDate: "2026-09-22",
    createdAt: "2026-09-18 14:45"
  }
};

// 📁 approvals — โฟลเดอร์ย่อยที่ซ้อนอยู่ในใบลาแต่ละใบ
// ใบ lr003 และ lr005 ยังไม่มีความเห็น เพราะยังไม่มีใครพิจารณา
// ⚠️ ใบ lr004 ที่สถานะ ไม่อนุมัติ ต้องมีความเห็นอย่างน้อย 1 รายการเสมอ
const APPROVALS = {
  lr001: {
    ap001: {
      authorId: "u002", authorName: "สมหญิง รักงาน",
      message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ",
      createdAt: "2026-09-01 13:40"
    },
    ap002: {
      authorId: "u003", authorName: "สมศรี ตั้งใจ",
      message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล",
      createdAt: "2026-09-02 10:05"
    }
  },
  lr002: {
    ap003: {
      authorId: "u002", authorName: "สมหญิง รักงาน",
      message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้",
      createdAt: "2026-08-24 09:20"
    }
  },
  lr004: {
    ap004: {
      authorId: "u002", authorName: "สมหญิง รักงาน",
      message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ",
      createdAt: "2026-09-20 15:10"
    }
  }
};

// ─────────────────────────────────────────────────────────────

const ที่วางผล = document.getElementById("บันทึกผล");
const ปุ่ม = document.getElementById("ปุ่มใส่ข้อมูล");

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    showConfigWarning("จึงยังใส่ข้อมูลตัวอย่างลงฐานข้อมูลไม่ได้");
    ปุ่ม.disabled = true;
    return;
  }
  // ⏳ ต้องล็อกอินก่อน ฐานข้อมูลจึงจะยอมให้เขียน
  const ผู้ใช้ = await requireLogin();
  if (!ผู้ใช้) return;

  ปุ่ม.addEventListener("click", ใส่ข้อมูล);
}

async function ใส่ข้อมูล() {
  ปุ่ม.disabled = true;
  ปุ่ม.textContent = "กำลังใส่ข้อมูล…";
  ที่วางผล.innerHTML = "";

  let นับ = 0;
  try {
    for (const [id, ข้อมูล] of Object.entries(USERS)) {
      await setDoc(doc(db, "users", id), ข้อมูล);
      นับ++; เขียนบรรทัด("📄 users/" + id + " — " + ข้อมูล.name);
    }
    for (const [id, ข้อมูล] of Object.entries(LEAVE_TYPES)) {
      await setDoc(doc(db, "leaveTypes", id), ข้อมูล);
      นับ++; เขียนบรรทัด("📄 leaveTypes/" + id + " — " + ข้อมูล.name);
    }
    for (const [id, ข้อมูล] of Object.entries(LEAVE_REQUESTS)) {
      await setDoc(doc(db, "leaveRequests", id), ข้อมูล);
      นับ++; เขียนบรรทัด("📄 leaveRequests/" + id + " — " + ข้อมูล.title);

      // โฟลเดอร์ย่อย approvals ของใบนี้ (ถ้ามีความเห็น)
      for (const [apId, ความเห็น] of Object.entries(APPROVALS[id] || {})) {
        await setDoc(doc(db, "leaveRequests", id, "approvals", apId), ความเห็น);
        นับ++; เขียนบรรทัด("   └ 📄 approvals/" + apId + " — " + ความเห็น.authorName);
      }
    }
    เขียนบรรทัด("✅ ใส่ข้อมูลสำเร็จทั้งหมด " + นับ + " ไฟล์", "alert alert-ok");
    เขียนบรรทัด("เปิด Firebase Console แล้วกดเข้าโฟลเดอร์ leaveRequests เพื่อดูด้วยตาตัวเอง", "hint");
  } catch (e) {
    เขียนบรรทัด("❌ ใส่ข้อมูลไม่สำเร็จ — " + แปลข้อผิดพลาด(e), "alert alert-error");
  } finally {
    ปุ่ม.disabled = false;
    ปุ่ม.textContent = "ใส่ข้อมูลตัวอย่างลง Firestore";
  }
}

function เขียนบรรทัด(ข้อความ, คลาส) {
  const บรรทัด = document.createElement("div");
  if (คลาส) บรรทัด.className = คลาส;
  บรรทัด.textContent = ข้อความ;
  ที่วางผล.appendChild(บรรทัด);
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธการเขียน · ตรวจ 2 อย่าง: ล็อกอินแล้วหรือยัง และกฎใน firestore.rules deploy ขึ้นไปแล้วหรือยัง";
  }
  return (e && e.message) || String(e);
}
