"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTranslation, type Language } from "@/lib/translations";

type Song = {
  title: string;
  artist: string;
  videoId: string;
};

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};

type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: (event: { data: number }) => void;
      };
    }
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const songs: Record<string, Song> = {
  "if-we-meet-again": {
    title: "ถ้าเราเจอกันอีก",
    artist: "Tilly Birds",
    videoId: "D1dhVo4e4wg",
  },
  drawn: {
    title: "วาดไว้",
    artist: "BOWKYLION",
    videoId: "t_AftHd91E4",
  },
  "lean-on": {
    title: "พิง",
    artist: "NONT TANONT",
    videoId: "6XA0eTaHeUk",
  },
  "jai-sung-ma": {
    title: "ใจสั่งมา",
    artist: "LOSO",
    videoId: "niukZCvB67I",
  },
};

const PLAYER_PLAYING = 1;
const PLAYER_ENDED = 0;

export default function KaraokePlayPage() {
  const router = useRouter();
  const params = useSearchParams();

  const songId = params?.get("song") || "if-we-meet-again";
  const gender = params?.get("voice") || "female";
  const song = songs[songId] || songs["if-we-meet-again"];

  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const languageRef = useRef<Language>("en");

  const [language, setLanguage] = useState<Language>("en");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playerError, setPlayerError] = useState("");
  const [apiError, setApiError] = useState("");

  const t = getTranslation(language);

  // อ่านภาษาจาก Cookie ของระบบหลัก
  useEffect(() => {
    const updateLanguage = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=(en|th)/);
      const currentLang = (match?.[1] || "en") as Language;

      setLanguage(currentLang);
      languageRef.current = currentLang;
    };

    updateLanguage();

    window.addEventListener("focus", updateLanguage);
    window.addEventListener("pageshow", updateLanguage);

    return () => {
      window.removeEventListener("focus", updateLanguage);
      window.removeEventListener("pageshow", updateLanguage);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);

    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  // อ่านเวลาจาก YouTube Player จริง
  const updateProgress = useCallback(() => {
    const player = playerRef.current;

    if (!player) return;

    try {
      const time = player.getCurrentTime();
      const total = player.getDuration();

      if (Number.isFinite(time)) {
        setCurrentTime(time);
      }

      if (Number.isFinite(total) && total > 0) {
        setDuration(total);
      }
    } catch {
      // Player ยังไม่พร้อม
    }
  }, []);

  // โหลด YouTube IFrame API และสร้าง Player
  useEffect(() => {
    let cancelled = false;
    let initialized = false;

    setReady(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayerError("");
    setApiError("");

    const createPlayer = () => {
      if (
        cancelled ||
        initialized ||
        !playerContainerRef.current ||
        !window.YT?.Player
      ) {
        return;
      }

      initialized = true;

      const playerElement = document.createElement("div");
      playerElement.className = "youtube-player";

      playerContainerRef.current.replaceChildren(playerElement);

      try {
        playerRef.current = new window.YT.Player(playerElement, {
          videoId: song.videoId,

          playerVars: {
            autoplay: 0,
            controls: 1,
            playsinline: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },

          events: {
            onReady: () => {
              if (cancelled) return;

              setReady(true);
              setApiError("");
              updateProgress();
            },

            onStateChange: (event) => {
              if (cancelled) return;

              setPlaying(event.data === PLAYER_PLAYING);

              if (event.data === PLAYER_ENDED) {
                updateProgress();
              }
            },

            onError: (event) => {
              if (cancelled) return;

              const errorMessages: Record<number, string> =
                languageRef.current === "th"
                  ? {
                      2: t.karaokeErrorInvalid,
                      5: t.karaokeErrorPlayer,
                      100: t.karaokeErrorNotFound,
                      101: t.karaokeErrorEmbedding,
                      150: t.karaokeErrorEmbedding,
                      153: t.karaokeErrorOrigin,
                    }
                  : {
                      2: t.karaokeErrorInvalid,
                      5: t.karaokeErrorPlayer,
                      100: t.karaokeErrorNotFound,
                      101: t.karaokeErrorEmbedding,
                      150: t.karaokeErrorEmbedding,
                      153: t.karaokeErrorOrigin,
                    };

              const errorText =
                errorMessages[event.data] ||
                `${t.karaokeErrorGeneric} ${event.data}`;

              setPlayerError(errorText);
              setReady(false);
              setPlaying(false);
            },
          },
        });
      } catch {
        initialized = false;
        setApiError(t.karaokeErrorCreatePlayer);
      }
    };

    const loadYouTubeAPI = () => {
      if (window.YT?.Player) {
        createPlayer();
        return;
      }

      const existingScript = document.getElementById(
        "youtube-iframe-api"
      );

      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        createPlayer();
      };

      if (!existingScript) {
        const script = document.createElement("script");

        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;

        script.onerror = () => {
          if (!cancelled) {
            setApiError(
              languageRef.current === "th"
                ? "ไม่สามารถโหลด YouTube API ได้ กรุณาตรวจสอบอินเทอร์เน็ต"
                : "Unable to load YouTube API. Please check your internet connection."
            );
          }
        };

        document.head.appendChild(script);
      }
    };

    loadYouTubeAPI();

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Player ถูกทำลายไปแล้ว
        }

        playerRef.current = null;
      }
    };
  }, [song.videoId, updateProgress]);

  // อัปเดตเวลาขณะเล่น
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return;
    }

    timerRef.current = setInterval(() => {
      updateProgress();
    }, 300);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, updateProgress]);

  // เล่น / หยุด
  const togglePlay = () => {
    const player = playerRef.current;

    if (!player || !ready) return;

    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  // เริ่มเพลงใหม่
  const restart = () => {
    const player = playerRef.current;

    if (!player || !ready) return;

    player.seekTo(0, true);
    player.playVideo();
    setCurrentTime(0);
  };

  // เลื่อนเวลาเพลง
  const seek = (value: number) => {
    const player = playerRef.current;

    if (!player || !ready) return;

    player.seekTo(value, true);
    setCurrentTime(value);
  };

  // เปลี่ยนความเร็ว
  const changeSpeed = (value: number) => {
    setSpeed(value);

    if (playerRef.current && ready) {
      playerRef.current.setPlaybackRate(value);
    }
  };

  const progress =
    duration > 0
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  return (
    <main className="room">
      <header className="topbar">
        <button
          className="back"
          onClick={() => router.push("/wellness/games/karaoke")}
        >
          {t.karaokeBackToSongs}
        </button>

        <span className="live">{t.karaokeRoom}</span>
      </header>

      <section className="song-header">
        <div className="disc">
          <span>♫</span>
        </div>

        <div className="song-info">
          <span className="eyebrow">{t.karaokeNowSinging}</span>
          <h1>{song.title}</h1>
          <p>{song.artist}</p>
        </div>
      </section>

      <section className="player-section">
        <div className="player-heading">
          <div>
            <h2>{t.karaokeSingTogether}</h2>
            <p>{t.karaokeSingDesc}</p>
          </div>

          <span className="karaoke-tag">{t.karaokeTag}</span>
        </div>

        <div className="video-container">
          {playerError || apiError ? (
            <div className="error-message">
              <span>⚠️</span>

              <p>{playerError || apiError}</p>

              <a
                href={`https://www.youtube.com/watch?v=${song.videoId}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.karaokeOpenYoutube}
              </a>

              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                {t.karaokeRetry}
              </button>
            </div>
          ) : (
            <div
              ref={playerContainerRef}
              className="youtube-player"
            />
          )}
        </div>

        {!ready && !playerError && !apiError && (
          <p className="loading-text">{t.karaokeLoading}</p>
        )}

        <div className="video-note">
          <span>{t.karaokeVideoNote}</span>
          <p>{t.karaokeVideoNoteText}</p>
        </div>
      </section>

      <section className="controls">
        <div className="progress-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <input
          className="progress"
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          style={
            { "--progress": `${progress}%` } as CSSProperties
          }
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!ready || duration === 0}
        />

        <div className="buttons">
          <button
            className="restart"
            onClick={restart}
            disabled={!ready}
            title={t.karaokeRestart}
          >
            ↺
          </button>

          <button
            className="play"
            onClick={togglePlay}
            disabled={!ready}
          >
            {playing ? t.karaokePause : t.karaokePlay}
          </button>
        </div>

        <div className="speed-control">
          <span>{t.karaokeSpeed}</span>

          <select
            value={speed}
            onChange={(e) => changeSpeed(Number(e.target.value))}
            disabled={!ready}
          >
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </section>

      <footer>
        <span>{t.karaokeSingFooter}</span>
        <span>
          AI Voice:{" "}
          {gender === "male"
            ? t.karaokeMaleVoice
            : t.karaokeFemaleVoice}
        </span>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .room {
          min-height: 100vh;
          padding: 25px;
          background: #f3f8f4;
          color: #24372d;
          font-family: Arial, sans-serif;
        }

        button {
          cursor: pointer;
          font-family: inherit;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1050px;
          margin: 0 auto 30px;
        }

        .back {
          border: 1px solid #c8e6d2;
          background: white;
          color: #28754c;
          border-radius: 30px;
          padding: 10px 18px;
          font-weight: bold;
        }

        .live {
          color: #258052;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .song-header {
          max-width: 850px;
          margin: 0 auto 22px;
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 22px 25px;
          background: white;
          border-radius: 22px;
          box-shadow: 0 5px 20px #1d493010;
        }

        .disc {
          width: 75px;
          height: 75px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: conic-gradient(
            #a9e6c1,
            #e2f7e9,
            #5bb887,
            #a9e6c1
          );
          animation: spin 7s linear infinite;
        }

        .disc span {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: white;
          color: #278454;
          font-size: 21px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .eyebrow {
          color: #29915b;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .song-info h1 {
          margin: 7px 0;
          font-size: 26px;
        }

        .song-info p {
          color: #7b8a80;
          margin: 0;
        }

        .player-section {
          max-width: 850px;
          margin: 0 auto 20px;
          padding: 22px;
          background: white;
          border-radius: 22px;
          box-shadow: 0 5px 20px #1d493010;
        }

        .player-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
        }

        .player-heading h2 {
          margin: 0 0 5px;
          font-size: 17px;
        }

        .player-heading p {
          margin: 0;
          color: #829087;
          font-size: 12px;
        }

        .karaoke-tag {
          padding: 7px 12px;
          border-radius: 20px;
          background: #edf8f0;
          color: #258052;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .video-container {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 15px;
          background: #101712;
        }

        .youtube-player {
          width: 100%;
          height: 100%;
        }

        .youtube-player :global(iframe) {
          width: 100%;
          height: 100%;
          border: 0;
        }

        .loading-text {
          text-align: center;
          color: #829087;
          font-size: 12px;
          margin: 12px 0 0;
        }

        .error-message {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          padding: 15px;
          text-align: center;
        }

        .error-message span {
          font-size: 30px;
        }

        .error-message p {
          margin: 0;
          font-size: 14px;
        }

        .error-message a {
          color: #a9e6c1;
          font-weight: bold;
        }

        .retry-button {
          padding: 8px 15px;
          border: 1px solid #a9e6c1;
          border-radius: 20px;
          background: transparent;
          color: white;
        }

        .video-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 15px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #f3faf5;
          color: #6d8273;
          font-size: 12px;
          line-height: 1.6;
        }

        .video-note p {
          margin: 0;
        }

        .controls {
          max-width: 850px;
          margin: auto;
          padding: 22px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 5px 20px #1d493010;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          color: #829087;
          font-size: 12px;
        }

        .progress {
          width: 100%;
          height: 6px;
          margin: 15px 0;
          appearance: none;
          border-radius: 10px;
          background: linear-gradient(
            to right,
            #25945a var(--progress),
            #e3ece5 var(--progress)
          );
          cursor: pointer;
        }

        .progress:disabled {
          cursor: not-allowed;
        }

        .progress::-webkit-slider-thumb {
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #21834f;
        }

        .progress::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border: none;
          border-radius: 50%;
          background: #21834f;
        }

        .buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 25px;
          margin: 10px 0 20px;
        }

        .restart {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: #edf7f0;
          color: #287c4c;
          font-size: 22px;
        }

        .play {
          min-width: 150px;
          padding: 15px 30px;
          border: none;
          border-radius: 40px;
          background: linear-gradient(110deg, #29945a, #17643d);
          color: white;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 5px 12px #17603a30;
        }

        .speed-control {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          color: #718276;
          font-size: 13px;
        }

        .speed-control select {
          padding: 8px 12px;
          border: 1px solid #dce9df;
          border-radius: 9px;
          background: #f8fcf9;
        }

        footer {
          max-width: 850px;
          margin: 22px auto 0;
          display: flex;
          justify-content: space-between;
          color: #8a9c90;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          .room {
            padding: 12px;
          }

          .topbar {
            margin-bottom: 18px;
          }

          .live {
            font-size: 10px;
            letter-spacing: 1px;
          }

          .song-header {
            padding: 17px;
            gap: 14px;
          }

          .disc {
            width: 60px;
            height: 60px;
          }

          .song-info h1 {
            font-size: 20px;
          }

          .player-section {
            padding: 15px;
          }

          .player-heading h2 {
            font-size: 15px;
          }

          .player-heading p {
            font-size: 11px;
          }

          .controls {
            padding: 16px;
          }

          footer {
            gap: 10px;
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}