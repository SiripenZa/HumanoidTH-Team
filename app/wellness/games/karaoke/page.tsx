"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTranslation, type Language } from "@/lib/translations";

const songs = [
  {
    id: "if-we-meet-again",
    title: "ถ้าเราเจอกันอีก",
    artist: "Tilly Birds",
    duration: "—",
    license: "เพลงไทย",
    color: "blue",
    symbol: "☾",
  },
  {
    id: "drawn",
    title: "วาดไว้",
    artist: "BOWKYLION",
    duration: "—",
    license: "เพลงไทย",
    color: "orange",
    symbol: "☀",
  },
  {
    id: "lean-on",
    title: "พิง",
    artist: "NONT TANONT",
    duration: "—",
    license: "เพลงไทย",
    color: "purple",
    symbol: "★",
  },
  {
    id: "jai-sung-ma",
    title: "ใจสั่งมา",
    artist: "LOSO",
    duration: "—",
    license: "เพลงไทย",
    color: "green",
    symbol: "❧",
  },
];

export default function KaraokePage() {
  const router = useRouter();

  const [selectedSong, setSelectedSong] = useState(songs[0]);
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("female");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testing, setTesting] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const t = getTranslation(language);

  // อ่านภาษาจาก Cookie เดียวกับระบบหลัก
  useEffect(() => {
    const updateLanguage = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=(en|th)/);
      setLanguage((match?.[1] || "en") as Language);
    };

    updateLanguage();

    window.addEventListener("focus", updateLanguage);
    window.addEventListener("pageshow", updateLanguage);

    return () => {
      window.removeEventListener("focus", updateLanguage);
      window.removeEventListener("pageshow", updateLanguage);
    };
  }, []);

  // โหลดเสียงที่ Browser รองรับ
useEffect(() => {
  if (!("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;

  const loadVoices = () => {
    const availableVoices = synth.getVoices();

    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      console.log("โหลดเสียงสำเร็จ:", availableVoices);
    }
  };

  loadVoices();

  synth.addEventListener("voiceschanged", loadVoices);

  // ลองโหลดเสียงซ้ำ เผื่อ Browser ยังโหลดไม่เสร็จ
  const retry = window.setInterval(() => {
    const availableVoices = synth.getVoices();

    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      window.clearInterval(retry);
    }
  }, 500);

  return () => {
    synth.removeEventListener("voiceschanged", loadVoices);
    window.clearInterval(retry);
    synth.cancel();
  };
}, []);
   

  // เลือกเสียงตามภาษาและเพศ
const getSelectedVoice = () => {
  // ภาษาไทย
  if (language === "th") {
    const thaiVoices = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith("th")
    );

    // ถ้ามีเสียงไทย ให้เลือกเสียงไทย
    // ถ้าไม่มี ให้คืน null เพื่อให้ Browser เลือกเสียงเอง
    return thaiVoices[0] || null;
  }

  // ภาษาอังกฤษ
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en")
  );

  if (selectedGender === "male") {
    return (
      englishVoices.find((voice) =>
        voice.name.toLowerCase().includes("david")
      ) ||
      englishVoices.find((voice) =>
        voice.name.toLowerCase().includes("mark")
      ) ||
      englishVoices[0] ||
      null
    );
  }

  return (
    englishVoices.find((voice) =>
      voice.name.toLowerCase().includes("zira")
    ) ||
    englishVoices[0] ||
    null
  );
};

  // ทดลองเสียง
const testVoice = () => {
  if (!("speechSynthesis" in window)) {
    alert(t.karaokeNoSupport);
    return;
  }

  window.speechSynthesis.cancel();

  const message =
    language === "th"
      ? selectedGender === "male"
        ? "สวัสดีครับ ยินดีต้อนรับสู่กิจกรรมร้องเพลง มาร้องเพลงด้วยกันนะครับ"
        : "สวัสดีค่ะ ยินดีต้อนรับสู่กิจกรรมร้องเพลง มาร้องเพลงด้วยกันนะคะ"
      : "Hello! Welcome to Karaoke with AI Bot. Let's sing together!";

  const utterance = new SpeechSynthesisUtterance(message);

  const voice = getSelectedVoice();

  // กำหนดภาษาให้ตรงกับภาษาที่เลือก
  utterance.lang = language === "th" ? "th-TH" : "en-US";

  // กำหนดเสียงเฉพาะเมื่อเสียงตรงกับภาษาที่เลือก
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  // ปรับระดับเสียงตามเพศที่เลือก
  if (selectedGender === "male") {
    utterance.pitch = language === "th" ? 0.75 : 0.75;
    utterance.rate = 0.95;
  } else {
    utterance.pitch = language === "th" ? 1.25 : 1.25;
    utterance.rate = 1;
  }

  utterance.volume = 1;

  utterance.onstart = () => setTesting(true);

  utterance.onend = () => {
    setTesting(false);
  };

  utterance.onerror = (event) => {
    console.error("Speech error:", event);
    setTesting(false);
  };

  window.speechSynthesis.speak(utterance);
};

  // ไปหน้าเล่นเพลง
  const startGame = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const url = `/wellness/games/karaoke/play?song=${selectedSong.id}&voice=${selectedGender}`;
    router.push(url);
  };

  return (
    <main className="karaoke-page">
      <header className="hero">
        <div className="hero-top">
          <button className="back-btn" onClick={() => router.push("/wellness")}>
            {t.karaokeBack}
          </button>
        </div>

        <div className="hero-content">
          <div>
            <h1>
              <span className="music-icon">♫</span>
              {t.karaokeTitle}
            </h1>
            <p>{t.karaokeSubtitle}</p>
          </div>

          <div className="hero-badge">{t.karaokeBadge}</div>
        </div>
      </header>

      <section className="voice-panel">
        <div className="voice-info">
          <div className="voice-icon">🔊</div>
          <div>
            <h3>{t.karaokeVoiceTitle}</h3>
            <p>{t.karaokeVoiceDesc}</p>
          </div>
        </div>

        <div className="voice-actions">
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value as "male" | "female");
              window.speechSynthesis?.cancel();
              setTesting(false);
            }}
          >
            <option value="female">{t.karaokeFemale}</option>
            <option value="male">{t.karaokeMale}</option>
          </select>

          <button className="test-btn" onClick={testVoice} disabled={testing}>
            🔊 {testing ? t.karaokeTesting : t.karaokeTestVoice}
          </button>
        </div>
      </section>

      <section className="song-section">
        <div className="section-heading">
          <div>
            <h2>{t.karaokeSongTitle}</h2>
            <p>{t.karaokeSongDesc}</p>
          </div>

          <span className="song-count">{t.karaokeSongCount}</span>
        </div>

        <div className="song-grid">
          {songs.map((song) => {
            const active = selectedSong.id === song.id;

            return (
              <button
                key={song.id}
                className={`song-card ${active ? "active" : ""}`}
                onClick={() => setSelectedSong(song)}
              >
                <div className={`song-cover ${song.color}`}>
                  <span>{song.symbol}</span>
                  <div className="check-circle">{active ? "✓" : ""}</div>
                </div>

                <div className="song-details">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>

                <div className="song-meta">
                  <span>{t.karaokeSongType}</span>
                  <span className="license">{t.karaokeSongLicense}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="selected-panel">
        <div className={`selected-cover ${selectedSong.color}`}>
          {selectedSong.symbol}
        </div>

        <div className="selected-info">
          <span>{t.karaokeSelectedSong}</span>
          <h3>{selectedSong.title}</h3>
          <p>{selectedSong.artist}</p>
        </div>

        <button type="button" className="start-btn" onClick={startGame}>
          {t.karaokeStart} <span>→</span>
        </button>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .karaoke-page {
          min-height: 100vh;
          padding: 5px;
          background: #f7f6f1;
          color: #202b3b;
          font-family: Arial, sans-serif;
        }

        button {
          font-family: inherit;
          cursor: pointer;
        }

        .hero {
          background:
            radial-gradient(circle at 65% 90%, #fffbea, transparent 20%),
            linear-gradient(110deg, #ffffff, #fafffc);
          border: 1px solid #c9f5df;
          border-radius: 22px;
          padding: 27px;
          min-height: 153px;
          box-shadow: 0 5px 15px #00000008;
        }

        .hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .back-btn {
          background: #effcf5;
          border: 1px solid #b8efd0;
          color: #087a49;
          border-radius: 30px;
          padding: 7px 15px;
          font-size: 13px;
          font-weight: bold;
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 12px;
        }

        .hero h1 {
          font-size: 29px;
          margin: 0 0 7px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .hero p {
          font-size: 14px;
          color: #647084;
          margin: 0;
        }

        .music-icon {
          background: #07855c;
          color: white;
          border-radius: 13px;
          padding: 5px 10px;
          margin-right: 9px;
        }

        .hero-badge {
          background: #effcf5;
          border: 1px solid #c9f5df;
          color: #087c50;
          padding: 14px 18px;
          border-radius: 15px;
          font-size: 13px;
          font-weight: bold;
        }

        .voice-panel {
          margin-top: 20px;
          padding: 19px 21px;
          background: white;
          border-radius: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          box-shadow: 0 3px 10px #00000008;
        }

        .voice-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .voice-icon {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: #d7f9e9;
          display: grid;
          place-items: center;
          font-size: 21px;
        }

        .voice-info h3 {
          font-size: 15px;
          margin: 0 0 4px;
        }

        .voice-info p {
          color: #778195;
          font-size: 12px;
          margin: 0;
        }

        .voice-actions {
          display: flex;
          gap: 10px;
        }

        .voice-actions select {
          width: 268px;
          max-width: 100%;
          padding: 10px;
          border: 1px solid #e0e4eb;
          background: #fafbfc;
          border-radius: 10px;
          color: #26364b;
        }

        .test-btn {
          padding: 10px 17px;
          border-radius: 11px;
          background: #effcf5;
          border: 1px solid #a9edca;
          color: #078351;
          font-weight: bold;
          white-space: nowrap;
        }

        .test-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .song-section {
          margin-top: 22px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .section-heading h2 {
          font-size: 17px;
          margin: 0 0 5px;
        }

        .section-heading p {
          color: #7c8796;
          font-size: 12px;
          margin: 0;
        }

        .song-count {
          border: 1px solid #b9efd1;
          border-radius: 20px;
          padding: 5px 12px;
          color: #078351;
          font-size: 12px;
          background: #f4fff8;
        }

        .song-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
        }

        .song-card {
          display: block !important;
          width: 100%;
          min-width: 0;
          text-align: left;
          background: white;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 12px;
          transition: 0.2s;
          overflow: hidden;
        }

        .song-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px #00000012;
        }

        .song-card.active {
          border: 2px solid #236443;
          box-shadow: 0 4px 12px #0000000d;
        }

        .song-cover {
          position: relative;
          display: grid;
          width: 100%;
          height: 107px;
          min-height: 107px;
          border-radius: 11px;
          place-items: center;
          font-size: 36px;
          margin-bottom: 10px;
          flex-shrink: 0;
        }

        .song-cover.pink,
        .selected-cover.pink {
          background: linear-gradient(135deg, #ffdee5, #ffd9df);
          color: #ec4899;
        }

        .song-cover.blue,
        .selected-cover.blue {
          background: linear-gradient(135deg, #a6c1ff, #a5b7f8);
          color: #ffdc58;
        }

        .song-cover.orange,
        .selected-cover.orange {
          background: linear-gradient(135deg, #ffdaa0, #ffe5b4);
          color: #f59e0b;
        }

        .song-cover.purple,
        .selected-cover.purple {
          background: linear-gradient(135deg, #a18bff, #8984f5);
          color: #ffe54c;
        }

        .song-cover.green,
        .selected-cover.green {
          background: linear-gradient(135deg, #b0f4d2, #baf4d9);
          color: #07855c;
        }

        .check-circle {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 23px;
          height: 23px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #a7bac4;
          color: white;
          font-size: 13px;
        }

        .active .check-circle {
          background: #009b70;
          box-shadow: 0 2px 5px #00000020;
        }

        .song-details {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 44px;
        }

        .song-details h3 {
          font-size: 13px;
          margin: 0 0 5px;
          color: #152238;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .song-details p {
          font-size: 11px;
          color: #65738a;
          margin: 0;
        }

        .song-meta {
          border-top: 1px solid #edf0f3;
          padding-top: 7px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          color: #607086;
        }

        .license {
          background: #f1f3f5;
          padding: 3px 6px;
          border-radius: 4px;
        }

        .selected-panel {
          margin-top: 20px;
          padding: 22px 20px;
          border-radius: 21px;
          border: 1px solid #e1e7ec;
          background: white;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 12px #00000008;
        }

        .selected-cover {
          width: 53px;
          height: 53px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .selected-info {
          flex: 1;
          min-width: 0;
        }

        .selected-info span {
          font-size: 11px;
          color: #8490a0;
        }

        .selected-info h3 {
          font-size: 16px;
          margin: 3px 0;
        }

        .selected-info p {
          font-size: 12px;
          color: #66758b;
          margin: 0;
        }

        .start-btn {
          background: linear-gradient(110deg, #27834f, #185839);
          border: none;
          color: white;
          padding: 16px 30px;
          border-radius: 40px;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 5px 12px #17603a30;
          white-space: nowrap;
          transition: 0.2s;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 16px #17603a45;
        }

        @media (max-width: 850px) {
          .song-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .hero-content {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .hero {
            padding: 20px;
          }

          .hero h1 {
            font-size: 22px;
          }

          .hero-top {
            align-items: flex-start;
          }

          .voice-panel {
            align-items: stretch;
            flex-direction: column;
          }

          .voice-actions {
            flex-direction: column;
          }

          .voice-actions select {
            width: 100%;
          }

          .song-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .selected-panel {
            flex-wrap: wrap;
          }

          .start-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}