DREAM RUNNER — Realistic 3D Forest Edition
===========================================

เวอร์ชันปรับฉากใหม่ด้วย Three.js / WebGL
- ฉากป่า 3 มิติแบบ perspective พร้อมแสง เงา หมอก และพื้นผิว procedural
- ตัวละคร 3 มิติแบบประกอบชิ้นส่วน พร้อมอนิเมชันแขนขา
- ทางเดินป่า ต้นไม้หลายระยะ ฝุ่นแสง และซุ้มเส้นชัย
- คงระบบกล้อง MediaPipe, ตรวจจับการหลับตา, เวลา 3/4/5 นาที,
  progress, ดาว, เสียง, พักเกม และเริ่มใหม่

ติดตั้งใน Next.js (แนะนำ)
--------------------------
1. แตก ZIP
2. คัดลอกโฟลเดอร์ dream_runner ไปไว้ที่:
   public/games/dream_runner/
3. เปิดเกมผ่าน:
   http://localhost:3000/games/dream_runner/index.html

หมายเหตุ:
- อย่าวางไฟล์ index.html/game.js/style.css ไว้ใน app/ โดยตรงเพื่อหวังให้
  Next.js สร้าง route ให้ เพราะ App Router ต้องใช้ page.js/page.jsx
- ถ้าต้องการให้หน้าเว็บเปิดเกมผ่าน route /games/dream_runner
  ให้สร้าง app/games/dream_runner/page.jsx แล้วฝัง iframe ที่ชี้ไปยัง
  /games/dream_runner/index.html

ตัวอย่าง page.jsx:
------------------
export default function DreamRunnerPage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh" }}>
      <iframe
        src="/games/dream_runner/index.html"
        title="Dream Runner"
        style={{ width: "100%", height: "100vh", border: 0, display: "block" }}
        allow="camera; autoplay"
      />
    </main>
  );
}

ข้อกำหนด:
- ต้องเปิดผ่าน localhost หรือ HTTPS เพื่อขอสิทธิ์กล้อง
- ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลด Three.js และ MediaPipe จาก CDN
- ผู้ใช้ต้องกดอนุญาตกล้องเอง
- วิดีโอกล้องประมวลผลภายในเบราว์เซอร์ ไม่มีการอัปโหลดวิดีโอในโค้ดนี้
- ฉาก 3D ในเวอร์ชันนี้สร้างจาก geometry และ texture แบบ procedural
  จึงเป็นฉาก 3D จริงแบบเรียลไทม์ แต่ยังไม่ใช่ asset ภาพถ่ายหรือโมเดลคน
  photogrammetry ระดับเกม AAA

การเล่น:
- เลือกเวลา 3, 4 หรือ 5 นาที
- เปิดกล้องและอนุญาตสิทธิ์
- กดเริ่ม แล้วหลับตาเบา ๆ เมื่อพร้อม ตัวละครและฉากจะเคลื่อนไปข้างหน้า
- ลืมตา พัก หรือหยุดเกมได้ทุกเมื่อ ไม่ต้องฝืนหลับตา
