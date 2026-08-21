// ─────────────────────────────────────────────────────────────
// js/firebase-config.example.js — ไฟล์ตัวอย่างค่าตั้งค่า Firebase
//
// 📌 วิธีใช้
//   1. คัดลอกไฟล์นี้เป็น  js/firebase-config.js
//   2. แทนค่าทุกช่องด้วยค่าของโปรเจกต์ตัวเอง
//      (Firebase Console → ⚙️ Project settings → Your apps → เลือกแอปเว็บ)
//   3. ขั้นตอนแบบละเอียดอยู่ในไฟล์ SETUP.md ขั้นที่ 4
//
// ⚠️ ไฟล์ js/firebase-config.js ถูก .gitignore กันไว้ **ห้าม commit**
//    ค่าชุดนี้ไม่ใช่รหัสผ่าน แต่เป็นค่าเฉพาะของแต่ละโปรเจกต์
//    สิ่งที่กันไม่ให้คนอื่นเข้ามาอ่านข้อมูลของเราคือ Security Rules ไม่ใช่การซ่อนค่าชุดนี้
// ─────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: "ใส่ค่า apiKey ของคุณ",
  authDomain: "ใส่ชื่อโปรเจกต์ของคุณ.firebaseapp.com",
  projectId: "ใส่ project id ของคุณ",
  storageBucket: "ใส่ชื่อโปรเจกต์ของคุณ.appspot.com",
  messagingSenderId: "ใส่ค่า messagingSenderId ของคุณ",
  appId: "ใส่ค่า appId ของคุณ"
};
