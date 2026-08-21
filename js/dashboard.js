// ─────────────────────────────────────────────────────────────
// js/dashboard.js — หน้าที่ 5 แดชบอร์ดสรุป
// สัปดาห์ที่ 6 (ต้นสัปดาห์): นับจากข้อมูลปลอมใน js/data.js
// ⚠️ ตัวเลขต้องนับจากข้อมูลจริงเสมอ ห้ามพิมพ์ตัวเลขค้างไว้ในโค้ด
// ─────────────────────────────────────────────────────────────

(function () {
  var สถานะทั้งหมด = ["รอพิจารณา", "อนุมัติ", "ไม่อนุมัติ"];

  var ใบลาที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
  var ใบลาทั้งหมด = window.LEAVE_DATA.leaveRequests.concat(ใบลาที่ยื่นใหม่);

  วาดตัวเลข(ใบลาทั้งหมด);
  วาดรายการล่าสุด(ใบลาทั้งหมด);

  function วาดตัวเลข(รายการ) {
    document.getElementById("กล่องตัวเลข").innerHTML = สถานะทั้งหมด.map(function (สถานะ) {
      var จำนวน = รายการ.filter(function (ใบ) { return ใบ.status === สถานะ; }).length;
      // กดกล่องตัวเลข แล้วไปหน้ารายการที่กรองสถานะนั้นไว้
      return '<a class="stat" href="leave-requests.html?status=' + encodeURIComponent(สถานะ) + '">' +
             '<div class="number">' + จำนวน + "</div>" +
             "<div>" + ป้ายสถานะ(สถานะ) + "</div></a>";
    }).join("");
  }

  function วาดรายการล่าสุด(รายการ) {
    var ล่าสุด = รายการ.slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; })   // ใหม่ไปเก่า
      .slice(0, 5);

    var ที่วาง = document.getElementById("รายการล่าสุด");
    if (ล่าสุด.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    ที่วาง.innerHTML =
      "<table><thead><tr><th>หัวข้อ</th><th>ผู้ขอลา</th><th>สถานะ</th></tr></thead><tbody>" +
      ล่าสุด.map(function (ใบ) {
        return '<tr class="clickable" onclick="location.href=\'leave-request-detail.html?id=' +
               esc(ใบ.id) + '\'"><td>' + esc(ใบ.title) + "</td><td>" + esc(ใบ.requesterName) +
               "</td><td>" + ป้ายสถานะ(ใบ.status) + "</td></tr>";
      }).join("") +
      "</tbody></table>";
  }
})();
