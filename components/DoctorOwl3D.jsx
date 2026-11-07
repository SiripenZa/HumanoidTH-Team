"use client";

// components/DoctorOwl3D.jsx  (v2: ตามแผ่นคาแรกเตอร์ Owl Doctor)
//
// Props
//   score         number|null  คะแนน ST-5 (0-15) → สีหน้าพื้นฐานตามช่วงคะแนน
//   state         "idle" | "thinking" | "speaking" | "caring" | "celebrate" | "wave"
//                 | "wink" | "surprised" | "love" | "sad"
//   size          ความกว้าง/สูง px (ค่าเริ่มต้น 220)
//   followPointer ให้ตา/หัวมองตามเมาส์หรือนิ้ว (ค่าเริ่มต้น true)
//
// ติดตั้ง: pnpm add three
// ต้องใช้ผ่าน dynamic import แบบ ssr:false

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EXPRESSIONS, bandFromScore } from "@/lib/owlExpressions";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;

// --------------------
// ทรงตัว: ถั่ว/ไข่สูง หัวเรียวกว่าลำตัวเล็กน้อย ยอดหัวค่อนข้างมน-แบน
// --------------------
const BODY_H = 1.1;
const BODY_Z = 0.92;

function radiusAt(y) {
  const n = clamp(y / BODY_H, -1, 1);
  const p = 2.5;
  const base = Math.pow(1 - Math.pow(Math.abs(n), p), 1 / p);
  return base * (1 - 0.15 * n);
}

// ระยะ z ของผิวลำตัวที่ (x, y)
function surf(x, y) {
  const r = radiusAt(y);
  return Math.sqrt(Math.max(0, r * r - x * x)) * BODY_Z;
}

function bodyGeometry() {
  const pts = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI;
    const y = -Math.cos(t) * BODY_H;
    pts.push(new THREE.Vector2(Math.max(radiusAt(y), 0.0001), y));
  }
  return new THREE.LatheGeometry(pts, 80);
}

// สี่เหลี่ยมมุมมน (ใช้ได้ทั้ง Shape และ Path)
function roundedRect(P, w, h, r) {
  const s = new P();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function rod(a, b, radius, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, len, 10),
    material
  );
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize()
  );
  return mesh;
}

function makeTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// --------------------
// สร้างโมเดล
// --------------------
function buildOwl() {
  const root = new THREE.Group();
  const bob = new THREE.Group();
  root.add(bob);

  // ---- texture ลายเนคไทก้างปลา / เอฟเฟกต์
  const tieTex = makeTex(32, 32, (ctx, w, h) => {
    ctx.fillStyle = "#1f4553";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#3a6f80";
    ctx.lineWidth = 2;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = col * 8;
        const y = row * 8;
        ctx.beginPath();
        if ((row + col) % 2 === 0) {
          ctx.moveTo(x, y + 8);
          ctx.lineTo(x + 8, y);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 8, y + 8);
        }
        ctx.stroke();
      }
    }
  });
  tieTex.wrapS = tieTex.wrapT = THREE.RepeatWrapping;
  tieTex.repeat.set(26, 26);

  const heartTex = makeTex(64, 64, (ctx) => {
    ctx.fillStyle = "#ff6f9c";
    ctx.beginPath();
    ctx.moveTo(32, 56);
    ctx.bezierCurveTo(4, 36, 6, 10, 24, 10);
    ctx.bezierCurveTo(30, 10, 32, 16, 32, 18);
    ctx.bezierCurveTo(32, 16, 34, 10, 40, 10);
    ctx.bezierCurveTo(58, 10, 60, 36, 32, 56);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.ellipse(21, 20, 5, 3, -0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  const exclaimTex = makeTex(64, 64, (ctx) => {
    ctx.strokeStyle = "#ffc93c";
    ctx.fillStyle = "#ffc93c";
    ctx.lineCap = "round";
    ctx.lineWidth = 9;
    [
      [22, 0.12],
      [42, -0.1],
    ].forEach(([x, tilt]) => {
      ctx.beginPath();
      ctx.moveTo(x - tilt * 20, 8);
      ctx.lineTo(x + tilt * 20, 36);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + tilt * 26, 50, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const sparkTex = makeTex(64, 64, (ctx) => {
    ctx.strokeStyle = "#ff8fb1";
    ctx.lineCap = "round";
    ctx.lineWidth = 6;
    [-0.9, -0.2, 0.5].forEach((a) => {
      ctx.beginPath();
      ctx.moveTo(32 + Math.cos(a) * 12, 40 + Math.sin(a) * -12);
      ctx.lineTo(32 + Math.cos(a) * 28, 40 + Math.sin(a) * -28);
      ctx.stroke();
    });
  });

  const M = {
    white: new THREE.MeshPhysicalMaterial({
      color: 0xeef1f0, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5,
    }),
    blue: new THREE.MeshPhysicalMaterial({
      color: 0x4f94aa, roughness: 0.5, clearcoat: 0.2,
    }),
    tie: new THREE.MeshStandardMaterial({ map: tieTex, roughness: 0.85 }),
    eye: new THREE.MeshPhysicalMaterial({
      color: 0x10232b, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05,
    }),
    iris: new THREE.MeshStandardMaterial({
      color: 0x86d6e4, emissive: 0x2f8ea0, emissiveIntensity: 0.55, roughness: 0.3,
    }),
    shine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    metal: new THREE.MeshStandardMaterial({
      color: 0xc9ced1, metalness: 0.95, roughness: 0.22,
    }),
    black: new THREE.MeshStandardMaterial({ color: 0x15181a, roughness: 0.5 }),
    closed: new THREE.MeshStandardMaterial({ color: 0x1b2d35, roughness: 0.5 }),
    brow: new THREE.MeshStandardMaterial({
      color: 0x4a7686, roughness: 0.6, transparent: true, opacity: 0,
    }),
    lens: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transparent: true, opacity: 0.07, roughness: 0, clearcoat: 1,
      side: THREE.DoubleSide,
    }),
    blush: new THREE.MeshBasicMaterial({
      color: 0xff9fb0, transparent: true, opacity: 0, depthWrite: false,
    }),
    pink: new THREE.MeshPhysicalMaterial({
      color: 0xff6f9c, roughness: 0.3, clearcoat: 0.8,
    }),
    tear: new THREE.MeshPhysicalMaterial({
      color: 0x9fe3f2, roughness: 0.05, transparent: true, opacity: 0,
    }),
  };

  // ---- ลำตัว
  const body = new THREE.Mesh(bodyGeometry(), M.white);
  body.scale.set(1, 1, BODY_Z);
  bob.add(body);

  // ---- แผ่นหน้าอกสีฟ้า (เรียบติดตัว ยอดมนอยู่ใต้จมูก)
  const panelY = -0.55;
  const panel = new THREE.Mesh(new THREE.SphereGeometry(1, 56, 36), M.blue);
  panel.scale.set(0.52, 0.78, 0.14);
  panel.position.set(0, panelY, surf(0, panelY) - 0.06);
  bob.add(panel);

  // ---- เนคไทลายก้างปลา
  const shape = new THREE.Shape();
  shape.moveTo(-0.05, 0);
  shape.lineTo(0.05, 0);
  shape.lineTo(0.04, -0.07);
  shape.lineTo(0.09, -0.4);
  shape.lineTo(0, -0.48);
  shape.lineTo(-0.09, -0.4);
  shape.lineTo(-0.04, -0.07);
  shape.closePath();
  const tie = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.025, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2,
    }),
    M.tie
  );
  tie.position.set(0, -0.02, 0.962);
  tie.rotation.x = -0.08;
  bob.add(tie);

  // ---- ปีก (ใหญ่ โค้งมน pivot ที่หัวไหล่)
  function makeWing(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.84, -0.05, 0);
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.5, 44, 30), M.white);
    wing.scale.set(0.38, 0.8, 0.56);
    wing.position.set(side * 0.12, -0.42, 0);
    pivot.add(wing);
    bob.add(pivot);
    return pivot;
  }
  const wingL = makeWing(-1);
  const wingR = makeWing(1);

  // ---- ตา + แว่นสี่เหลี่ยมมุมมน
  const EYE_X = 0.36;
  const EYE_Y = 0.45;
  const eyes = [];

  [-1, 1].forEach((side) => {
    const g = new THREE.Group();
    g.position.set(side * EYE_X, EYE_Y, surf(EYE_X, EYE_Y) - 0.03);
    g.rotation.y = side * 0.28;

    const ball = new THREE.Group();
    g.add(ball);

    const dark = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 24), M.eye);
    dark.scale.set(1, 1.02, 0.4);
    ball.add(dark);

    const look = new THREE.Group();
    look.position.z = 0.05;
    ball.add(look);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.12, 28, 20), M.iris);
    iris.scale.set(1, 0.78, 0.3);
    iris.position.set(0, -0.06, 0.02);
    look.add(iris);

    const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), M.shine);
    h1.scale.set(1, 1, 0.3);
    h1.position.set(0.07, 0.085, 0.08);
    ball.add(h1);

    const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), M.shine);
    h2.scale.set(1, 1, 0.3);
    h2.position.set(-0.06, -0.09, 0.08);
    ball.add(h2);

    // ตาหยีโค้ง ^ (Happy / Love)
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.024, 10, 24, Math.PI),
      M.closed
    );
    arc.position.set(0, -0.04, 0.1);
    arc.visible = false;
    g.add(arc);

    // ตาขยิบ < (Wink) — ใช้กับตาขวาเท่านั้น
    const chev = new THREE.Group();
    const r1 = rod(new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0.08, 0.09, 0), 0.02, M.closed);
    const r2 = rod(new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0.08, -0.09, 0), 0.02, M.closed);
    chev.add(r1, r2);
    chev.position.set(0, -0.02, 0.1);
    chev.visible = false;
    g.add(chev);

    // น้ำตา
    const tear = new THREE.Mesh(
      new THREE.SphereGeometry(0.034, 14, 12),
      M.tear.clone()
    );
    tear.scale.set(1, 1.5, 0.6);
    tear.position.set(side * 0.04, -0.2, 0.08);
    tear.visible = false;
    g.add(tear);

    bob.add(g);
    eyes.push({ side, ball, look, h2, arc, chev, tear });

    // กรอบแว่น
    const zf = surf(EYE_X, EYE_Y) + 0.14;
    const outer = roundedRect(THREE.Shape, 0.6, 0.5, 0.1);
    outer.holes.push(roundedRect(THREE.Path, 0.5, 0.4, 0.07));
    const frame = new THREE.Mesh(
      new THREE.ExtrudeGeometry(outer, {
        depth: 0.03, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2,
      }),
      M.metal
    );
    frame.position.set(side * EYE_X, EYE_Y, zf);
    frame.rotation.y = side * 0.12;
    bob.add(frame);

    const lens = new THREE.Mesh(
      new THREE.ShapeGeometry(roundedRect(THREE.Shape, 0.5, 0.4, 0.07)),
      M.lens
    );
    lens.position.set(side * EYE_X, EYE_Y, zf + 0.018);
    lens.rotation.y = side * 0.12;
    bob.add(lens);

    // ขาแว่นสีดำ ต่อเข้ากับสายคล้องหัว
    bob.add(
      rod(
        new THREE.Vector3(side * 0.66, EYE_Y + 0.03, zf - 0.02),
        new THREE.Vector3(side * 0.65, EYE_Y + 0.03, 0.56),
        0.016,
        M.black
      )
    );
  });

  // สายสีดำคล้องรอบหัว (ครึ่งหลัง)
  {
    const cy = EYE_Y + 0.03;
    const r = radiusAt(cy) + 0.02;
    const pts = [];
    const a0 = (48 * Math.PI) / 180;
    const a1 = (312 * Math.PI) / 180;
    for (let i = 0; i <= 56; i++) {
      const a = a0 + ((a1 - a0) * i) / 56;
      pts.push(new THREE.Vector3(r * Math.sin(a), cy, r * Math.cos(a) * BODY_Z));
    }
    bob.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.016, 8),
        M.black
      )
    );
  }

  // สะพานแว่น
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), M.metal);
  bridge.position.set(0, EYE_Y + 0.1, surf(0, EYE_Y) + 0.14);
  bob.add(bridge);

  // ---- จะงอยปาก (จมูกกลมมนทับขอบบนแผ่นฟ้า)
  const beak = new THREE.Mesh(new THREE.SphereGeometry(0.1, 28, 20), M.white);
  beak.scale.set(1.15, 1.25, 1);
  beak.position.set(0, 0.37, surf(0, 0.37) + 0.07);
  bob.add(beak);

  // ---- สเต็ทโตสโคป: ห่วงยาวทางซ้าย + หัวเล็กห้อยทางขวา
  const stethL = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.66, 0.45, 0.56),
        new THREE.Vector3(-0.82, 0.15, 0.6),
        new THREE.Vector3(-0.9, -0.25, 0.57),
        new THREE.Vector3(-0.85, -0.55, 0.56),
        new THREE.Vector3(-0.74, -0.55, 0.6),
        new THREE.Vector3(-0.72, -0.25, 0.64),
        new THREE.Vector3(-0.7, 0.05, 0.64),
      ]),
      60,
      0.017,
      8
    ),
    M.black
  );
  bob.add(stethL);

  bob.add(
    rod(new THREE.Vector3(0.65, 0.46, 0.56), new THREE.Vector3(0.7, 0.28, 0.58), 0.014, M.black)
  );
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 24), M.metal);
  bell.rotation.x = Math.PI / 2;
  bell.position.set(0.7, 0.24, 0.6);
  bob.add(bell);

  // ---- คิ้ว (โปร่งใส จะปรากฏเมื่อทำหน้ากังวล/ตกใจ)
  const brows = [];
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    const baseY = 0.86;
    pivot.position.set(side * EYE_X, baseY, surf(EYE_X, baseY) + 0.04);
    pivot.userData.baseY = baseY;
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.18, 6, 12), M.brow);
    b.rotation.z = Math.PI / 2;
    pivot.add(b);
    bob.add(pivot);
    brows.push({ pivot, side });
  });

  // ---- แก้มแดง
  const blushes = [];
  [-1, 1].forEach((side) => {
    const bl = new THREE.Mesh(new THREE.CircleGeometry(0.1, 28), M.blush.clone());
    bl.scale.set(1.3, 0.8, 1);
    bl.position.set(side * 0.58, 0.14, surf(0.58, 0.14) + 0.012);
    bl.rotation.y = side * 0.65;
    bob.add(bl);
    blushes.push(bl);
  });

  // ---- หัวใจชมพูที่กอด (Love / ห่วงใย)
  const hs = new THREE.Shape();
  hs.moveTo(0, 0.12);
  hs.bezierCurveTo(0, 0.2, -0.12, 0.26, -0.22, 0.2);
  hs.bezierCurveTo(-0.34, 0.12, -0.28, -0.06, 0, -0.28);
  hs.bezierCurveTo(0.28, -0.06, 0.34, 0.12, 0.22, 0.2);
  hs.bezierCurveTo(0.12, 0.26, 0, 0.2, 0, 0.12);
  const heart = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hs, {
      depth: 0.08, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4,
    }),
    M.pink
  );
  heart.position.set(0, -0.5, 1.08);
  heart.visible = false;
  bob.add(heart);

  // ---- เอฟเฟกต์ลอย: หัวใจ / !! / ประกาย
  function sprite(tex) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })
    );
    s.visible = false;
    bob.add(s);
    return s;
  }
  const fxHearts = [0, 1, 2, 3].map(() => sprite(heartTex));
  const fxExclaim = sprite(exclaimTex);
  const fxSparks = [sprite(sparkTex), sprite(sparkTex)];

  return {
    root, bob, body, wingL, wingR, eyes, brows, beak, blushes,
    heart, fxHearts, fxExclaim, fxSparks,
    textures: [tieTex, heartTex, exclaimTex, sparkTex],
  };
}

function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

// --------------------
// Component
// --------------------
export default function DoctorOwl3D({
  score = null,
  state = "idle",
  size = 220,
  followPointer = true,
  className,
  style,
}) {
  const mountRef = useRef(null);
  const propsRef = useRef({ score, state, followPointer });
  const popRef = useRef(0);
  const prevScore = useRef(score);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    propsRef.current = { score, state, followPointer };
  }, [score, state, followPointer]);

  useEffect(() => {
    if (prevScore.current !== score) popRef.current = 1;
    prevScore.current = score;
  }, [score]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (e) {
      setFailed(true);
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.25, 7.8);
    camera.lookAt(0, 0.2, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2.5, 3.5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfe9f2, 0.8);
    rim.position.set(-3, 2, -2);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3e6, 0.5));

    const owl = buildOwl();
    scene.add(owl.root);

    function resize() {
      const w = mount.clientWidth || size;
      const h = mount.clientHeight || size;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const pointer = { x: 0, y: 0, last: -10 };
    function onMove(e) {
      const rect = mount.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointer.x = clamp((e.clientX - cx) / (window.innerWidth * 0.45), -1, 1);
      pointer.y = clamp(-(e.clientY - cy) / (window.innerHeight * 0.45), -1, 1);
      pointer.last = performance.now() / 1000;
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const motion = reduce ? 0.25 : 1;

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    const cur = { ...EXPRESSIONS.neutral, lookX: 0, lookY: 0 };
    let blinkAt = 1.5;
    let blinkT = -1;
    let prev = performance.now() / 1000;
    let t = 0;

    renderer.setAnimationLoop(() => {
      const now = performance.now() / 1000;
      const dt = Math.min(now - prev, 0.05);
      prev = now;
      if (!visible) return;
      t += dt;

      const P = propsRef.current;
      const band = bandFromScore(P.score);
      const tg = { ...EXPRESSIONS[band] };

      // ---- ทิศที่มอง
      let lx;
      let ly;
      if (P.followPointer && now - pointer.last < 3) {
        lx = pointer.x;
        ly = pointer.y * 0.8;
      } else {
        lx = Math.sin(t * 0.45) * 0.45 * motion;
        ly = Math.sin(t * 0.31 + 1) * 0.2 * motion;
      }

      // ช่วงคะแนนต่ำ: ยิ้มตาโค้ง ^ ^ เป็นระยะ ๆ
      if (band === "low" && P.state === "idle") {
        tg.happy = Math.sin(t * 0.9) > 0.72 ? 1 : 0;
      }

      // ---- สถานะ (ทับค่าพื้นฐานตามคะแนน)
      switch (P.state) {
        case "thinking":
          lx = -0.6;
          ly = 0.75;
          tg.browY += 0.05;
          tg.browAsym = 0.35;
          tg.tilt += 0.1;
          break;
        case "speaking":
          tg.talk = 1;
          break;
        case "caring":
          tg.browTilt = Math.max(tg.browTilt, 0.55);
          tg.pupil = Math.max(tg.pupil, 1.25);
          tg.sad = Math.max(tg.sad, 0.4);
          tg.heart = 0.85;
          tg.hug = 0.85;
          tg.tilt = Math.max(tg.tilt, 0.1);
          lx *= 0.4;
          break;
        case "celebrate":
          tg.happy = 1;
          tg.blush = 0.9;
          tg.wing = 1.5;
          tg.fxSpark = 1;
          tg.sad = 0;
          tg.heart = 0;
          tg.hug = 0;
          tg.jump = Math.abs(Math.sin(t * 6)) * 0.28 * motion;
          break;
        case "wave":
          tg.waveAmt = 1;
          tg.blush = Math.max(tg.blush, 0.4);
          break;
        case "wink":
          tg.wink = 1;
          tg.blush = Math.max(tg.blush, 0.5);
          tg.fxSpark = 0.8;
          break;
        case "surprised":
          tg.eyeOpen = 1.15;
          tg.pupil = 0.65;
          tg.browY = 0.12;
          tg.browTilt = -0.05;
          tg.fxExclaim = 1;
          tg.sad = 0;
          tg.heart = 0;
          tg.hug = 0;
          tg.jump = Math.max(0, Math.sin(t * 10)) * 0.06 * motion;
          break;
        case "love":
          tg.happy = 1;
          tg.blush = 1;
          tg.heart = 1;
          tg.hug = 1;
          tg.fxHearts = 1;
          tg.sad = 0;
          break;
        case "sad":
          tg.sad = 1;
          tg.tear = 1;
          tg.browTilt = 0.7;
          tg.eyeOpen = 0.95;
          tg.pupil = 1.3;
          tg.wing = 0.1;
          tg.tilt = 0.1;
          break;
        default:
          break;
      }

      // ---- ค่อย ๆ เปลี่ยน
      const k = 1 - Math.exp(-dt * 6);
      const kFast = 1 - Math.exp(-dt * 16);
      for (const key2 of Object.keys(tg)) {
        cur[key2] = lerp(cur[key2], tg[key2], key2 === "talk" ? kFast : k);
      }
      cur.lookX = lerp(cur.lookX, lx, 1 - Math.exp(-dt * 8));
      cur.lookY = lerp(cur.lookY, ly, 1 - Math.exp(-dt * 8));

      // ---- กะพริบตา
      let blink = 1;
      if (t > blinkAt && blinkT < 0) blinkT = 0;
      if (blinkT >= 0) {
        blinkT += dt;
        const p = blinkT / 0.16;
        blink = 1 - Math.sin(clamp(p, 0, 1) * Math.PI) * 0.95;
        if (p >= 1) {
          blinkT = -1;
          blinkAt = t + 2 + Math.random() * 3.5;
        }
      }

      popRef.current = Math.max(0, popRef.current - dt * 1.6);
      const pop = Math.sin(popRef.current * Math.PI) * 0.1;

      const o = owl;

      // ---- ตา
      o.eyes.forEach(({ side, ball, look, h2, arc, chev, tear }) => {
        const winkClose = side === 1 ? 1 - cur.wink : 1;
        ball.scale.y = Math.max(
          0.001,
          cur.eyeOpen * blink * (1 - cur.happy) * winkClose * (1 - 0.1 * cur.sad)
        );
        ball.scale.x = 1 + (cur.eyeOpen - 1) * 0.35;
        ball.position.y = -cur.sad * 0.02;
        look.position.x = cur.lookX * 0.07;
        look.position.y = cur.lookY * 0.055;
        look.scale.setScalar(cur.pupil);
        h2.scale.set(1 + cur.sad * 1.1, 1 + cur.sad * 1.1, 0.3);

        arc.visible = cur.happy > 0.05;
        arc.scale.setScalar(Math.max(0.001, cur.happy));

        chev.visible = side === 1 && cur.wink > 0.05;
        chev.scale.setScalar(Math.max(0.001, cur.wink));

        tear.visible = cur.tear > 0.05;
        if (tear.visible) {
          const ph = (t * 0.8 + (side === 1 ? 0.35 : 0)) % 1;
          tear.position.y = -0.2 - ph * 0.3;
          tear.material.opacity = cur.tear * (1 - ph) * 0.9;
        }
      });

      // ---- คิ้ว (โปร่งใสจนกว่าจะทำหน้ากังวล/ตกใจ/ร่าเริงชัด)
      const browVis = clamp(
        Math.abs(cur.browTilt) * 2.2 + Math.abs(cur.browY) * 5 + cur.sad * 0.8,
        0,
        1
      );
      o.brows.forEach(({ pivot, side }) => {
        const asym = side === 1 ? cur.browAsym : 0;
        pivot.position.y = pivot.userData.baseY + cur.browY + asym * 0.08;
        pivot.rotation.z = side === -1 ? cur.browTilt : -cur.browTilt;
        if (asym) pivot.rotation.z += side * -asym * 0.3;
        pivot.children[0].material.opacity = browVis * 0.85;
      });

      // ---- จะงอยปากขยับตอนพูด (ไม่มีปากในดีไซน์)
      o.beak.scale.set(1.15, 1.25 * (1 + cur.talk * 0.1 * Math.sin(t * 15)), 1);

      // ---- แก้ม
      o.blushes.forEach((b) => {
        b.material.opacity = clamp(cur.blush, 0, 1) * 0.7;
      });

      // ---- หัวใจที่กอด
      o.heart.visible = cur.heart > 0.03;
      o.heart.scale.setScalar(Math.max(0.001, cur.heart * (1.1 + 0.06 * Math.sin(t * 6))));

      // ---- เอฟเฟกต์ลอย
      o.fxHearts.forEach((s, i) => {
        const ph = (t * 0.55 + i * 0.27) % 1;
        const a = Math.sin(ph * Math.PI);
        s.visible = cur.fxHearts > 0.03;
        s.position.set((i - 1.5) * 0.38 + Math.sin(t * 2 + i) * 0.04, 0.95 + ph * 0.65, 0.55);
        s.material.opacity = clamp(cur.fxHearts, 0, 1) * a;
        s.scale.setScalar(0.2 + 0.1 * a);
      });
      o.fxExclaim.visible = cur.fxExclaim > 0.03;
      o.fxExclaim.position.set(0.8, 1.12, 0.5);
      o.fxExclaim.material.opacity = clamp(cur.fxExclaim, 0, 1);
      o.fxExclaim.scale.setScalar(0.42 * cur.fxExclaim * (1 + 0.08 * Math.sin(t * 12)));
      o.fxSparks.forEach((s, i) => {
        const sd = i === 0 ? -1 : 1;
        s.visible = cur.fxSpark > 0.03;
        s.position.set(sd * 0.78, 1.0 + 0.03 * Math.sin(t * 3 + i), 0.5);
        s.material.opacity = clamp(cur.fxSpark, 0, 1);
        s.material.rotation = (sd === 1 ? -0.4 : 0.4) + Math.sin(t * 3 + i) * 0.25;
        s.scale.setScalar(0.26 * cur.fxSpark * (1 + 0.2 * Math.sin(t * 7 + i * 2)));
      });

      // ---- หายใจ / โยก / กระโดด / เด้ง
      o.body.scale.y = 1 + Math.sin(t * 1.7 * cur.breath) * 0.012;
      o.bob.position.y =
        Math.sin(t * 1.25 * (0.6 + cur.bounce * 0.4)) * 0.035 * cur.bounce * motion +
        cur.jump +
        pop;
      const s = 1 + pop * 0.5;
      o.bob.scale.set(s, s, s);

      // ---- หัน/เอียง/พยักหน้าตอนพูด
      const sway = Math.sin(t * 0.8) * 0.02 * motion;
      o.root.rotation.z = lerp(o.root.rotation.z, cur.tilt + sway, 0.2);
      o.root.rotation.y = lerp(o.root.rotation.y, cur.lookX * 0.32, 0.12);
      o.root.rotation.x = lerp(
        o.root.rotation.x,
        -cur.lookY * 0.12 + cur.talk * Math.sin(t * 9) * 0.035 * motion,
        0.12
      );

      // ---- ปีก (กาง / โอบหัวใจ / โบกมือ)
      const flutter = Math.sin(t * 2.2 * cur.bounce) * 0.04 * motion;
      const wa = cur.wing * (1 - cur.hug * 0.6) + flutter;
      const wave = cur.waveAmt;
      o.wingL.rotation.z = -wa + cur.hug * 0.3;
      o.wingL.rotation.x = -cur.hug * 0.85;
      o.wingR.rotation.x = -cur.hug * 0.85;
      o.wingR.rotation.z =
        (1 - wave) * (wa - cur.hug * 0.3) + wave * (2.1 + Math.sin(t * 10) * 0.28);

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      disposeTree(owl.root);
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // สร้างซีนครั้งเดียว
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label =
    typeof score === "number"
      ? `หมอฮูก 3 มิติ ท่าทางตามผลประเมิน ${score} จาก 15`
      : "หมอฮูก 3 มิติ";

  return (
    <div
      role="img"
      aria-label={label}
      className={className}
      style={{ position: "relative", width: size, height: size, ...style }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "18%",
          right: "18%",
          bottom: "6%",
          height: "9%",
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgba(20,50,60,.28), rgba(20,50,60,0))",
        }}
      />
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
      {failed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontSize: size * 0.5,
          }}
        >
          🦉
        </div>
      )}
    </div>
  );
}