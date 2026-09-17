// ─────────────────────────────────────────────────────────────
// scripts/seed-admin.js — ใส่ข้อมูลตัวอย่างลง Firestore ผ่าน Admin SDK
//
// รันตรงจาก Node.js ไม่ผ่านหน้าเว็บ จึงไม่ต้องล็อกอินและไม่ผ่าน
// firestore.rules (Admin SDK มีสิทธิ์เต็มเสมอ) — ใช้สำหรับใส่ข้อมูล
// ตั้งต้นตอนที่ยังไม่ได้เปิด Authentication เท่านั้น
//
// ข้อมูลชุดนี้ตรงกับที่ js/seed.js ใช้ เพื่อไม่ให้มีข้อมูลตัวอย่าง
// สองชุดที่เพี้ยนไปคนละทาง
//
// วิธีรัน:
//   node scripts/seed-admin.js
//
// ⚠️ ต้องมีไฟล์ leaveeasy-johncrth-firebase-adminsdk.json อยู่ที่ root โปรเจกต์ก่อน
//    ไฟล์นี้ถูก .gitignore กันไว้แล้ว ห้าม commit
// ─────────────────────────────────────────────────────────────

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../leaveeasy-johncrth-firebase-adminsdk.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

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

async function main() {
  let นับ = 0;

  for (const [id, ข้อมูล] of Object.entries(USERS)) {
    await db.collection("users").doc(id).set(ข้อมูล);
    นับ++; console.log("📄 users/" + id + " — " + ข้อมูล.name);
  }
  for (const [id, ข้อมูล] of Object.entries(LEAVE_TYPES)) {
    await db.collection("leaveTypes").doc(id).set(ข้อมูล);
    นับ++; console.log("📄 leaveTypes/" + id + " — " + ข้อมูล.name);
  }
  for (const [id, ข้อมูล] of Object.entries(LEAVE_REQUESTS)) {
    await db.collection("leaveRequests").doc(id).set(ข้อมูล);
    นับ++; console.log("📄 leaveRequests/" + id + " — " + ข้อมูล.title);

    for (const [apId, ความเห็น] of Object.entries(APPROVALS[id] || {})) {
      await db.collection("leaveRequests").doc(id).collection("approvals").doc(apId).set(ความเห็น);
      นับ++; console.log("   └ 📄 approvals/" + apId + " — " + ความเห็น.authorName);
    }
  }

  console.log("✅ ใส่ข้อมูลสำเร็จทั้งหมด " + นับ + " ไฟล์");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ ใส่ข้อมูลไม่สำเร็จ —", e.message || e);
    process.exit(1);
  });
