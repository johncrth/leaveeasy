// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 7: อ่านจาก Firestore · เปลี่ยนสถานะจริง · เขียนความเห็นลงโฟลเดอร์ย่อย approvals
// ─────────────────────────────────────────────────────────────

import {
  db, hasConfig, doc, getDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, where
} from "./firebase.js";
import { requireLogin } from "./auth.js";
import { ถามAI, มีคีย์AI } from "./ai.js";

const รหัสใบลา = ค่าจากURL("id");
const กล่องใบลา = document.getElementById("กล่องใบลา");
const กล่องความเห็น = document.getElementById("กล่องความเห็น");

// ผู้ที่กำลังใช้งาน = คนที่ล็อกอินอยู่จริง (เติมค่าตอนเริ่มทำงาน)
let ผู้ใช้ปัจจุบัน = null;

let ใบ = null;          // ข้อมูลใบลาใบนี้
let ความเห็น = [];      // รายการในโฟลเดอร์ย่อย approvals

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    showConfigWarning("จึงยังเปิดดูรายละเอียดใบลาจากฐานข้อมูลไม่ได้");
    กล่องใบลา.innerHTML = "";
    return;
  }
  // ⏳ ต้องรอให้รู้สถานะล็อกอินก่อน แล้วค่อยอ่านข้อมูลจากฐานข้อมูล
  ผู้ใช้ปัจจุบัน = await requireLogin();
  if (!ผู้ใช้ปัจจุบัน) return;

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
    await ตั้งค่าผู้ช่วยAI();
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

  // ปุ่มอนุมัติ / ไม่อนุมัติ / ลบ ขึ้นเฉพาะใบที่ยังรอพิจารณา และต้องตรงสิทธิ์ตาม ACL.md ด้วย
  // 🔒 อนุมัติ/ไม่อนุมัติ — เฉพาะผู้อนุมัติและฝ่ายบุคคล (เจ้าของใบเปลี่ยนสถานะใบตัวเองไม่ได้)
  // 🔒 ลบใบลานี้ — เฉพาะเจ้าของใบเท่านั้น (ผู้อนุมัติลบใบของคนอื่นไม่ได้ แม้จะเห็นใบนั้นก็ตาม)
  const ยังรอพิจารณา = ใบ.status === "รอพิจารณา";
  const เป็นผู้อนุมัติ = ผู้ใช้ปัจจุบัน.role === "manager" || ผู้ใช้ปัจจุบัน.role === "hr";
  const เป็นเจ้าของใบ = ผู้ใช้ปัจจุบัน.uid === ใบ.requesterId;
  const แสดงปุ่มพิจารณา = ยังรอพิจารณา && เป็นผู้อนุมัติ;
  const แสดงปุ่มลบ = ยังรอพิจารณา && เป็นเจ้าของใบ;

  if (!ยังรอพิจารณา) {
    html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้ และลบไม่ได้</p>';
  } else if (แสดงปุ่มพิจารณา || แสดงปุ่มลบ) {
    html += '<div class="btn-row">';
    if (แสดงปุ่มพิจารณา) {
      html +=
        '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
        '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>';
    }
    if (แสดงปุ่มลบ) {
      html += '<button type="button" class="btn-ghost" id="ปุ่มลบ">ลบใบลานี้</button>';
    }
    html += "</div>";
  } else {
    html += '<p class="hint">ใบนี้ยังรอพิจารณาอยู่ · คุณไม่มีสิทธิ์ทำอะไรกับใบนี้เพิ่มเติม</p>';
  }
  html += '<div id="เตือนสถานะ" class="alert alert-error hidden"></div>';

  กล่องใบลา.innerHTML = html;

  if (แสดงปุ่มพิจารณา) {
    document.getElementById("ปุ่มอนุมัติ")
      .addEventListener("click", () => เปลี่ยนสถานะ("อนุมัติ"));
    document.getElementById("ปุ่มไม่อนุมัติ")
      .addEventListener("click", () => เปลี่ยนสถานะ("ไม่อนุมัติ"));
  }
  if (แสดงปุ่มลบ) {
    document.getElementById("ปุ่มลบ").addEventListener("click", ลบใบลา);
  }
}

// ── ลบใบลา (ตัว D ของ CRUD) ──
// ลบได้เฉพาะใบที่สถานะยังเป็น รอพิจารณา และต้องถามยืนยันก่อนเสมอ
async function ลบใบลา() {
  const เตือน = document.getElementById("เตือนสถานะ");

  if (ใบ.status !== "รอพิจารณา") {
    เตือน.textContent = "⚠️ ใบที่พิจารณาแล้ว ลบไม่ได้";
    เตือน.classList.remove("hidden");
    return;
  }
  if (!confirm('ยืนยันการลบใบลา "' + ใบ.title + '" หรือไม่ · ลบแล้วกู้กลับไม่ได้')) return;

  try {
    await deleteDoc(doc(db, "leaveRequests", ใบ.id));
    location.href = "leave-requests.html";
  } catch (e) {
    เตือน.textContent = "❌ ลบไม่สำเร็จ — " + แปลข้อผิดพลาด(e);
    เตือน.classList.remove("hidden");
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

// ─────────────────────────────────────────────────────────────
// 🤖 ผู้ช่วย AI ระดับที่ 2 — ไปอ่านข้อมูลหลายที่เองก่อน แล้วค่อยสรุป
// ต่างจากปุ่มในหน้ายื่นใบลาใหม่ที่ส่งข้อความไปถามครั้งเดียว
// ─────────────────────────────────────────────────────────────

async function ตั้งค่าผู้ช่วยAI() {
  const กล่องAI = document.getElementById("กล่องAI");
  const ปุ่ม = document.getElementById("ปุ่มAIสรุป");

  // ผู้ช่วยตัวนี้มีไว้ให้หัวหน้าอ่านก่อนตัดสินใจ จึงแสดงเฉพาะผู้อนุมัติและฝ่ายบุคคล
  const เป็นผู้อนุมัติ = ผู้ใช้ปัจจุบัน.role === "manager" || ผู้ใช้ปัจจุบัน.role === "hr";
  if (!เป็นผู้อนุมัติ) return;

  กล่องAI.classList.remove("hidden");

  // ถ้าเคยให้ AI สรุปไว้แล้ว ให้แสดงของเดิมทันที
  if (ใบ.aiSuggestion) แสดงผลสรุปAI(ใบ.aiSuggestion, ใบ.aiSteps);

  if (!(await มีคีย์AI())) {
    ปุ่ม.disabled = true;
    ปุ่ม.title = "ยังไม่ได้ใส่คีย์ในไฟล์ js/config.js";
    บอกผลAI("ยังไม่ได้ใส่คีย์ผู้ช่วย AI — พิจารณาเองได้ตามปกติ (วิธีใส่คีย์อยู่ใน SETUP.md ขั้นที่ 8)");
    return;
  }
  ปุ่ม.addEventListener("click", ให้AIสรุป);
}

async function ให้AIสรุป() {
  const ปุ่ม = document.getElementById("ปุ่มAIสรุป");

  ปุ่ม.disabled = true;
  ปุ่ม.textContent = "⏳ กำลังให้ AI อ่านข้อมูล…";

  const บันทึกขั้นตอน = [];   // เก็บว่า AI ไปอ่านอะไรมาบ้าง จะได้ตรวจย้อนหลังได้

  try {
    // ขั้นที่ 1 — ใบลาใบนี้
    บันทึกขั้นตอน.push({ step: "อ่านใบลาใบนี้", detail: ใบ.title, at: เวลาตอนนี้() });
    บอกผลAI("ขั้นที่ 1/3 — อ่านใบลาใบนี้…");

    // ขั้นที่ 2 — ประวัติการลาของผู้ขอลาคนเดียวกัน
    บอกผลAI("ขั้นที่ 2/3 — ค้นประวัติการลาของผู้ขอลาคนนี้…");
    const ผลค้น = await getDocs(
      query(collection(db, "leaveRequests"), where("requesterId", "==", ใบ.requesterId))
    );
    const ประวัติ = ผลค้น.docs
      .map((f) => ({ id: f.id, ...f.data() }))
      .filter((x) => x.id !== ใบ.id);
    บันทึกขั้นตอน.push({
      step: "ค้นประวัติการลาของผู้ขอลา",
      detail: "พบใบลาอื่นของคนนี้ " + ประวัติ.length + " ใบ",
      at: เวลาตอนนี้()
    });

    // ขั้นที่ 3 — ความเห็นที่เขียนไว้แล้วในใบนี้
    บันทึกขั้นตอน.push({
      step: "อ่านความเห็นในโฟลเดอร์ approvals",
      detail: "มีความเห็น " + ความเห็น.length + " รายการ",
      at: เวลาตอนนี้()
    });
    บอกผลAI("ขั้นที่ 3/3 — ส่งข้อมูลทั้งหมดให้ AI สรุป…");

    const ข้อมูลที่ส่งไป =
      "ใบลาที่กำลังพิจารณา\n" +
      "หัวข้อ: " + ใบ.title + "\n" +
      "ประเภทการลา: " + ใบ.leaveTypeName + "\n" +
      "วันที่ลา: " + ใบ.startDate + " ถึง " + ใบ.endDate + "\n" +
      "เหตุผล: " + ใบ.reason + "\n\n" +
      "ประวัติการลาที่ผ่านมาของผู้ขอลาคนนี้ (" + ประวัติ.length + " ใบ)\n" +
      (ประวัติ.length === 0
        ? "- ไม่มีใบลาอื่นในระบบ\n"
        : ประวัติ.map((x) =>
            "- " + x.startDate + " ถึง " + x.endDate + " · " + x.leaveTypeName + " · " + x.status
          ).join("\n") + "\n") +
      "\nความเห็นที่เขียนไว้แล้วในใบนี้ (" + ความเห็น.length + " รายการ)\n" +
      (ความเห็น.length === 0
        ? "- ยังไม่มีความเห็น"
        : ความเห็น.map((c) => "- " + c.authorName + ": " + c.message).join("\n"));

    const คำตอบ = await ถามAI(
      "คุณเป็นผู้ช่วยของหัวหน้างานที่กำลังจะพิจารณาใบลา " +
      "สรุปให้อ่านเข้าใจง่ายภายใน 4 บรรทัด เป็นภาษาไทย โดยแยกเป็นหัวข้อสั้น ๆ ดังนี้ " +
      "1) ขอลาอะไร กี่วัน 2) ประวัติการลาที่ผ่านมาน่าสังเกตอะไรไหม " +
      "3) ข้อควรพิจารณาก่อนตัดสินใจ " +
      "ห้ามตัดสินใจแทน ห้ามบอกว่าให้อนุมัติหรือไม่อนุมัติ ให้เสนอข้อมูลอย่างเดียว",
      ข้อมูลที่ส่งไป
    );

    บันทึกขั้นตอน.push({ step: "AI สรุปเสร็จ", detail: "ความยาว " + คำตอบ.length + " ตัวอักษร", at: เวลาตอนนี้() });

    // เก็บผลไว้ในใบลา จะได้ไม่ต้องเรียกซ้ำ และตรวจย้อนหลังได้ว่า AI อ่านอะไรมา
    await updateDoc(doc(db, "leaveRequests", ใบ.id), {
      aiSuggestion: คำตอบ,
      aiSteps: บันทึกขั้นตอน
    });
    ใบ.aiSuggestion = คำตอบ;
    ใบ.aiSteps = บันทึกขั้นตอน;

    // 📁 leaveRequests/{id}/aiLog — เก็บทุกครั้งที่เรียก AI ไว้เป็นประวัติ (ไม่ทับของเก่า)
    await addDoc(collection(db, "leaveRequests", ใบ.id, "aiLog"), {
      input: ข้อมูลที่ส่งไป,
      output: คำตอบ,
      createdAt: เวลาตอนนี้()
    });

    แสดงผลสรุปAI(คำตอบ, บันทึกขั้นตอน);
  } catch (e) {
    // เรียกไม่สำเร็จต้องไม่ทำให้ระบบค้าง ยังกดอนุมัติหรือไม่อนุมัติเองได้ตามปกติ
    บอกผลAI("เรียก AI ไม่สำเร็จ — " + ((e && e.message) || String(e)) +
            " · พิจารณาเองแล้วกดอนุมัติหรือไม่อนุมัติได้ตามปกติ");
  } finally {
    ปุ่ม.disabled = false;
    ปุ่ม.textContent = "ให้ AI สรุปใบลานี้ให้หัวหน้าอ่าน";
  }
}

function แสดงผลสรุปAI(ข้อความ, ขั้นตอน) {
  const กล่อง = document.getElementById("ผลสรุปAI");
  กล่อง.innerHTML =
    "<strong>🤖 ข้อเสนอจาก AI — โปรดตรวจสอบก่อนยืนยัน</strong><br>" +
    esc(ข้อความ).replace(/\n/g, "<br>");
  กล่อง.classList.remove("hidden");

  const ที่วางขั้นตอน = document.getElementById("ขั้นตอนAI");
  if (!Array.isArray(ขั้นตอน) || ขั้นตอน.length === 0) return;
  ที่วางขั้นตอน.innerHTML =
    '<p class="hint">AI ไปอ่านอะไรมาบ้าง</p>' +
    ขั้นตอน.map((s) =>
      '<div class="comment"><div class="meta">' + esc(s.at) + "</div><div>" +
      esc(s.step) + " — " + esc(s.detail) + "</div></div>"
    ).join("");
  ที่วางขั้นตอน.classList.remove("hidden");
}

function บอกผลAI(ข้อความ) {
  const กล่อง = document.getElementById("ผลสรุปAI");
  กล่อง.textContent = ข้อความ;
  กล่อง.classList.remove("hidden");
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธ · ตรวจว่าล็อกอินแล้วหรือยัง และมีสิทธิ์ทำสิ่งนี้หรือไม่";
  }
  return (e && e.message) || String(e);
}
