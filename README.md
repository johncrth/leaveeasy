# 🔧 LeaveEasy — ระบบขอลาออนไลน์

**เฉลยตัวอย่าง** ของหลักสูตร **ADT-RAISE Non-Degree Batch 2 · Module 2: MVP-Ready** (สัปดาห์ที่ 6–9)

พนักงานยื่นใบลาผ่านหน้าเว็บ → หัวหน้าพิจารณา → อนุมัติหรือไม่อนุมัติ → บันทึกผลไว้ให้เปิดดูย้อนหลังได้

เขียนด้วย **HTML · CSS · JavaScript ธรรมดา** ไม่มี framework ไม่มีขั้นตอน build
ฐานข้อมูลและล็อกอินใช้ **Firebase** (Firestore · Authentication · Security Rules · Hosting)

---

## 👋 สำหรับผู้เรียน

### นี่คืออะไร

repo นี้คือ **เฉลยตัวอย่างประกอบใบงาน** ของ Module 2
เปิดดูได้ทุกเมื่อ เพื่อ **เทียบกับโครงงานของกลุ่มตัวเอง** ว่า

- ขั้นตอนที่ใบงานให้ทำ ผลลัพธ์ควรหน้าตาแบบไหน
- ไฟล์ควรวางไว้ตรงไหน
- ชื่อโฟลเดอร์และชื่อช่องข้อมูลบน Firestore ควรสะกดอย่างไร

### ⚠️ ห้าม fork repo นี้ไปส่งเป็นงานของกลุ่ม

- คาบบ่ายวันเสาร์ **กลุ่มของคุณทำโครงงานของกลุ่มเอง** (โจทย์จาก Hackathon สัปดาห์ที่ 1)
- repo นี้เป็นระบบคนละโดเมนกับโครงงานของคุณ ใช้ **ดูเทียบ** เท่านั้น
- ตอน Sprint 1 Review **ทุกคนในกลุ่มต้องอธิบายโค้ดของตัวเองได้** — ส่งโค้ดที่ลอกมาแล้วอธิบายไม่ได้ จะไม่ผ่านเกณฑ์เดือน

### 🌟 อยากได้ประโยชน์สูงสุด — สร้างเองด้วย prompt ดีกว่าอ่านโค้ดสำเร็จ

ถ้าอยากตามให้ทันหลังจากขาดคาบ หรืออยากซ้อมทำเอง
ให้ใช้ **ชุดกู้สถานะ** ใน repo ของหลักสูตร `raise2-module2` ที่โฟลเดอร์

```
materials/shared/recovery/
   leaveeasy-week6-end.md
   leaveeasy-week7-end.md
   leaveeasy-week8-end.md
```

ในนั้นคือ **ชุด prompt ภาษาไทยที่คัดลอกไปวางกับ Claude Code ได้ทันที**
สิ่งที่คุณเห็นใน repo นี้คือ *ผลลัพธ์* ของ prompt ชุดนั้น
**การพิมพ์ prompt แล้วอ่านตรวจสิ่งที่ AI ทำ ได้ฝึกมากกว่าการอ่านโค้ดที่เสร็จแล้ว**

---

## 🏷️ แท็ก ↔ สัปดาห์

แต่ละแท็กคือ **สถานะของระบบเมื่อจบสัปดาห์นั้น** — สะสมขึ้นไปเรื่อย ๆ

| แท็ก | ตรงกับ | ระบบทำอะไรได้ถึงจุดนั้น |
|---|---|---|
| `week6-start` | ก่อนเริ่มใบงานที่ 1 | หน้าจอครบ 5 หน้า + หน้าแรก · ข้อมูลปลอมใน `js/data.js` · **ยังไม่ต่อฐานข้อมูล** |
| `week6-end` | จบสัปดาห์ที่ 6 | + ต่อ Firestore · หน้า `seed.html` ใส่ข้อมูลตัวอย่าง · **หน้ารายการอ่านจากฐานจริง (ตัว R)** |
| `week7-end` | จบสัปดาห์ที่ 7 | + **CRUD ครบ 4 ตัว** · ล็อกอินด้วย Firebase Authentication · กฎขั้นต่ำ "ต้องล็อกอินก่อน" · ตั้งค่า Hosting · `CLAUDE.md` |
| `week8-end` | จบสัปดาห์ที่ 8 | + **Security Rules รายห้องครบ 5 ข้อ** · 🤖 ปุ่มผู้ช่วย AI ผ่าน OpenRouter 2 ระดับ · sub-agent `reviewer` |
| `week9-end` | จบสัปดาห์ที่ 9 (= `main`) | + ชุดทดสอบอัตโนมัติ **Playwright** · sub-agent `tester` |

### วิธีเปิดดู

```bash
git clone https://github.com/cnacha-mfu/leaveeasy.git
cd leaveeasy
git checkout week6-end        # เปลี่ยนเป็นแท็กที่อยากดู
```

ดูรายการแท็กทั้งหมด: `git tag`
กลับมาที่สถานะล่าสุด: `git checkout main`

### เปิดหน้าเว็บดูอย่างไร

| แท็ก | วิธีเปิด |
|---|---|
| `week6-start` | **ดับเบิลคลิกไฟล์ `index.html` เปิดในเบราว์เซอร์ได้เลย** (หรือ `npm install` แล้ว `npm run dev`) |
| `week6-end` เป็นต้นไป | ต้องทำตาม **[SETUP.md](SETUP.md)** ก่อน เพราะไฟล์ค่าตั้งค่าของ Firebase **ไม่ได้อยู่ใน repo** (กันคีย์หลุด) แล้วเปิดด้วย `npm run dev` |

> 📌 ทำไมแท็กหลัง `week6-start` ถึงเปิดตรง ๆ ไม่ได้
> เพราะตั้งแต่ `week6-end` หน้าเว็บใช้ **โมดูล** และคุยกับ **Firestore** ซึ่งต้องเปิดผ่านเซิร์ฟเวอร์ในเครื่อง (`npm run dev`)
> และต้องมีไฟล์ `js/firebase-config.js` ที่ **แต่ละคนสร้างเอง** ตาม SETUP.md

---

## 📁 โครงสร้างไฟล์ (สถานะล่าสุด)

```
leaveeasy/
├── index.html                    หน้าแรก รวมลิงก์ทุกหน้า
├── login.html                    เข้าสู่ระบบ / สมัครสมาชิก
├── leave-requests.html           หน้าที่ 1 รายการใบลา
├── new-leave-request.html        หน้าที่ 2 ยื่นใบลาใหม่
├── leave-request-detail.html     หน้าที่ 3 รายละเอียดใบลา
├── leave-types.html              หน้าที่ 4 จัดการประเภทการลา
├── dashboard.html                หน้าที่ 5 แดชบอร์ดสรุป
├── seed.html                     ปุ่มใส่ข้อมูลตัวอย่างลง Firestore
├── css/style.css                 หน้าตาที่ใช้ร่วมกันทุกหน้า
├── js/
│   ├── firebase-config.example.js   ตัวอย่างค่าตั้งค่า (คัดลอกเป็น firebase-config.js)
│   ├── config.example.js            ตัวอย่างคีย์ OpenRouter (คัดลอกเป็น config.js)
│   ├── firebase.js                  เชื่อมต่อ Firebase ที่เดียว
│   ├── auth.js                      ล็อกอิน / สมัคร / ออกจากระบบ
│   ├── ai.js                        เรียก AI ผ่าน OpenRouter
│   ├── nav.js                       แถบเมนูที่ใช้ร่วมกันทุกหน้า
│   └── (ไฟล์ .js ประจำแต่ละหน้า)
├── firestore.rules               กฎเฝ้าข้อมูล
├── firebase.json                 ค่าตั้งค่าการนำขึ้นออนไลน์
├── tests/                        ชุดทดสอบอัตโนมัติ Playwright (สัปดาห์ที่ 9)
├── .claude/agents/reviewer.md    ผู้ช่วยตรวจโค้ด (สัปดาห์ที่ 8)
├── .claude/agents/tester.md      ผู้ช่วยเขียนและรันเทสต์ (สัปดาห์ที่ 9)
└── CLAUDE.md                     คู่มือประจำโครงงานที่ Claude Code อ่านก่อนทำงาน
```

---

## 🗂️ โครงสร้างข้อมูลบน Firestore

> 📁 Collection = โฟลเดอร์ · 📄 Document = ไฟล์ · ✏️ Field = ข้อมูลในไฟล์

```
📁 users/
   📄 u001  { name, email, role }

📁 leaveTypes/
   📄 lt001 { name }

📁 leaveRequests/
   📄 lr001 { title, reason, status,
              requesterId,  requesterName,
              approverId,   approverName,
              leaveTypeId,  leaveTypeName,
              startDate, endDate, createdAt }
      📁 approvals/
         📄 ap001 { authorId, authorName, message, createdAt }
```

**สถานะของใบลาใช้ได้ 3 ค่าเท่านั้น:** `รอพิจารณา` → `อนุมัติ` / `ไม่อนุมัติ`

**บทบาทผู้ใช้ 3 แบบ:** `employee` (ผู้ขอลา) · `manager` (ผู้อนุมัติ) · `hr` (ฝ่ายบุคคล)

---

## 🔒 ความปลอดภัย

- **ไม่มีคีย์จริงอยู่ใน repo นี้** — ไฟล์ `js/firebase-config.js` และ `js/config.js` ถูก `.gitignore` กันไว้
  ใน repo มีแต่ไฟล์ตัวอย่าง `*.example.js` ที่ใส่ค่าปลอมไว้
- คีย์ OpenRouter ที่วางไว้ในหน้าเว็บ **คนอื่นเปิดดูได้** — ยอมรับได้เฉพาะในคาบเรียนเท่านั้น
  เพราะผู้สอนตั้งวงเงินไว้ · **ไม่ใช่วิธีที่ถูกต้องสำหรับระบบจริง** (จดไว้ใน Backlog Sprint 2 แล้ว)
- ข้อมูลตัวอย่างทุกชิ้นใช้ **ชื่อสมมติ** (สมชาย · สมหญิง · สมศรี) และอีเมลตัวอย่าง `@example.com`

---

## 📚 ระบบคู่ขนาน

ในคาบบรรยาย ผู้สอนสาธิตด้วยระบบ **FixIt (ระบบแจ้งซ่อมออนไลน์)** ซึ่งมีโครงสร้างเทียบกับ LeaveEasy ได้ 1:1

| 🎬 FixIt (บรรยาย) | 🔧 LeaveEasy (Lab) | 👥 โครงงานของกลุ่มคุณ |
|---|---|---|
| `tickets` | `leaveRequests` | ? |
| `reporterId` / `reporterName` | `requesterId` / `requesterName` | ? |
| `assigneeId` / `assigneeName` | `approverId` / `approverName` | ? |
| `categories` | `leaveTypes` | ? |
| `comments` (โฟลเดอร์ย่อย) | `approvals` (โฟลเดอร์ย่อย) | ? |

**ช่องขวาสุดคือของกลุ่มคุณ — เติมเอง**

---

## 👤 ผู้จัดทำ

johncrth
