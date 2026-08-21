// ─────────────────────────────────────────────────────────────
// js/ai.js — เรียกผู้ช่วย AI ผ่าน OpenRouter
//
// 📌 กติกาที่ไฟล์นี้บังคับไว้ให้ทุกหน้าที่เรียกใช้
//   • รอได้ไม่เกิน 15 วินาที เกินกว่านั้นเลิกรอ ระบบต้องไม่ค้าง
//   • เรียกไม่สำเร็จให้โยนข้อความภาษาไทยที่บอกว่าเกิดอะไรขึ้นและควรทำอะไรต่อ
//   • คีย์อ่านจากไฟล์ js/config.js ที่ .gitignore กันไว้เท่านั้น ห้ามเขียนคีย์ลงไฟล์อื่น
// ─────────────────────────────────────────────────────────────

const ที่อยู่OpenRouter = "https://openrouter.ai/api/v1/chat/completions";
const วินาทีที่รอได้ = 15;

let ค่าตั้งค่า = null;
let อ่านค่าแล้ว = false;

// อ่านคีย์จาก js/config.js · ถ้ายังไม่มีไฟล์ จะได้ค่า null โดยไม่พังทั้งหน้า
async function โหลดค่าตั้งค่า() {
  if (อ่านค่าแล้ว) return ค่าตั้งค่า;
  อ่านค่าแล้ว = true;
  try {
    const โมดูล = await import("./config.js");
    const คีย์ = โมดูล.OPENROUTER_API_KEY;
    if (!คีย์ || คีย์.startsWith("ใส่คีย์")) {
      ค่าตั้งค่า = null;
    } else {
      ค่าตั้งค่า = { คีย์, โมเดล: โมดูล.OPENROUTER_MODEL || "openai/gpt-4o-mini" };
    }
  } catch (e) {
    ค่าตั้งค่า = null;
  }
  return ค่าตั้งค่า;
}

// ใช้เช็คก่อนแสดงปุ่ม AI ว่ากลุ่มนี้ใส่คีย์ไว้หรือยัง
export async function มีคีย์AI() {
  return (await โหลดค่าตั้งค่า()) !== null;
}

// ถาม AI หนึ่งครั้ง แล้วคืนข้อความตอบกลับเป็นข้อความธรรมดา
// คำสั่งระบบ = บอกว่าให้ทำตัวเป็นอะไรและตอบรูปแบบไหน
// คำถาม     = ข้อมูลจริงที่ให้ AI อ่าน
export async function ถามAI(คำสั่งระบบ, คำถาม) {
  const cfg = await โหลดค่าตั้งค่า();
  if (!cfg) {
    throw new Error("ยังไม่ได้ใส่คีย์ AI — คัดลอก js/config.example.js เป็น js/config.js แล้วใส่คีย์ของกลุ่ม");
  }

  // ตัวจับเวลา ถ้าเกิน 15 วินาทีให้เลิกรอ ระบบจะได้ไม่ค้าง
  const ตัวยกเลิก = new AbortController();
  const นาฬิกา = setTimeout(() => ตัวยกเลิก.abort(), วินาทีที่รอได้ * 1000);

  try {
    const ผล = await fetch(ที่อยู่OpenRouter, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + cfg.คีย์
      },
      body: JSON.stringify({
        model: cfg.โมเดล,
        temperature: 0,
        messages: [
          { role: "system", content: คำสั่งระบบ },
          { role: "user", content: คำถาม }
        ]
      }),
      signal: ตัวยกเลิก.signal
    });

    if (!ผล.ok) {
      if (ผล.status === 401) throw new Error("คีย์ AI ไม่ถูกต้องหรือหมดอายุ — แจ้งผู้สอนเพื่อขอคีย์ใหม่");
      if (ผล.status === 402) throw new Error("วงเงินของคีย์กลุ่มหมดแล้ว — แจ้งผู้สอน");
      if (ผล.status === 429) throw new Error("เรียกถี่เกินไป รอสักครู่แล้วลองใหม่");
      throw new Error("เรียก AI ไม่สำเร็จ (รหัส " + ผล.status + ")");
    }

    const ข้อมูล = await ผล.json();
    const คำตอบ = ข้อมูล && ข้อมูล.choices && ข้อมูล.choices[0] &&
                  ข้อมูล.choices[0].message && ข้อมูล.choices[0].message.content;
    if (!คำตอบ) throw new Error("AI ตอบกลับมาว่างเปล่า ลองกดใหม่อีกครั้ง");
    return String(คำตอบ).trim();

  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("รอเกิน " + วินาทีที่รอได้ + " วินาทีแล้วยังไม่ตอบ — ทำเองต่อได้ตามปกติ");
    }
    if (e instanceof TypeError) {
      throw new Error("ต่ออินเทอร์เน็ตไม่ได้ — ตรวจการเชื่อมต่อ แล้วทำเองต่อได้ตามปกติ");
    }
    throw e;
  } finally {
    clearTimeout(นาฬิกา);
  }
}
