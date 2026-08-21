// ─────────────────────────────────────────────────────────────
// js/firebase.js — จุดเชื่อมต่อ Firebase ที่เดียวของทั้งโปรเจกต์
//
// ทุกหน้าที่ต้องใช้ฐานข้อมูล ให้ import จากไฟล์นี้
// จะได้แก้เวอร์ชันหรือค่าตั้งค่าที่เดียว แล้วเปลี่ยนพร้อมกันทั้งระบบ
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// อ่านค่าตั้งค่าจากไฟล์ js/firebase-config.js ที่แต่ละคนสร้างเอง
// ถ้ายังไม่ได้สร้าง จะไม่พังทั้งหน้า แต่จะขึ้นแถบเตือนสีเหลืองแทน
let ค่าตั้งค่า = null;
try {
  const โมดูล = await import("./firebase-config.js");
  ค่าตั้งค่า = โมดูล.firebaseConfig;
} catch (e) {
  ค่าตั้งค่า = null;
}

// ตรวจว่ามีค่าจริง ไม่ใช่ข้อความตัวอย่างที่ยังไม่ได้แทนค่า
export const hasConfig = Boolean(
  ค่าตั้งค่า && ค่าตั้งค่า.projectId && !ค่าตั้งค่า.projectId.startsWith("ใส่")
);

export const app = hasConfig ? initializeApp(ค่าตั้งค่า) : null;
export const db = hasConfig ? getFirestore(app) : null;

// ส่งต่อคำสั่งของ Firestore ที่หน้าอื่นต้องใช้
// เขียนชื่อเวอร์ชันไว้ที่ไฟล์นี้ไฟล์เดียว หน้าอื่นจะได้ไม่ต้องจำที่อยู่ยาว ๆ
export {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
