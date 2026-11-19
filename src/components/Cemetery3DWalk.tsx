"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SkipForward, Volume2, VolumeX } from "lucide-react";
import type { DigitalFlowerRecord, MemorialPlotRecord } from "@/lib/types";

interface Cemetery3DWalkProps {
  plot: MemorialPlotRecord;
  flowers?: DigitalFlowerRecord[];
  onArrive: () => void;
  onCancel: () => void;
}

function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#5F7756";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const shades = ["#526A49", "#6B8460", "#768E69", "#4B6143", "#819672"];
    ctx.fillStyle = shades[i % shades.length];
    ctx.fillRect(x, y, 2, 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 22);
  return tex;
}

function createStonePathTexture(template: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const isBrick = template.includes("Brick");
  ctx.fillStyle = isBrick ? "#9C7868" : "#C9C3B8";
  ctx.fillRect(0, 0, 256, 256);

  const rows = isBrick ? 8 : 5;
  const cols = isBrick ? 4 : 3;
  const rh = 256 / rows;
  const cw = 256 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : cw / 2;
    for (let c = -1; c <= cols; c++) {
      const shade = isBrick
        ? ["#A8806E", "#977160", "#B08977"][(r + c + 4) % 3]
        : ["#D4CFC4", "#C7C1B5", "#DDD8CE", "#BEB8AC"][(r * 3 + c + 4) % 4];
      ctx.fillStyle = shade;
      ctx.fillRect(c * cw + offset + 3, r * rh + 3, cw - 6, rh - 6);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 22);
  return tex;
}

export function Cemetery3DWalk({
  plot,
  flowers = [],
  onArrive,
  onCancel,
}: Cemetery3DWalkProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [walkDurationSec, setWalkDurationSec] = useState<10 | 30 | 60 | 120>(
    10
  );
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    setProgress(0);
    setArrived(false);
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#DCE5DF");
    scene.fog = new THREE.FogExp2("#DCE5DF", 0.018);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 140);
    camera.position.set(0, 1.68, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Golden-afternoon lighting
    const hemi = new THREE.HemisphereLight("#FFFDF6", "#4F634A", 1.1);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight("#FFEED2", 1.6);
    sun.position.set(18, 26, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    // Lush textured lawn
    const grassTex = createGrassTexture();
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 })
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    scene.add(lawn);

    // Cobblestone / Brick pathway
    const pathTex = createStonePathTexture(plot.pathway_template);
    const pathway = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 80),
      new THREE.MeshStandardMaterial({ map: pathTex, roughness: 0.85 })
    );
    pathway.rotation.x = -Math.PI / 2;
    pathway.position.y = 0.02;
    pathway.receiveShadow = true;
    scene.add(pathway);

    // Stone border curbs
    const curbMat = new THREE.MeshStandardMaterial({
      color: "#BEB8AA",
      roughness: 0.8,
    });
    const curbGeo = new THREE.BoxGeometry(0.18, 0.1, 80);
    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-1.78, 0.05, 0);
    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(1.78, 0.05, 0);
    scene.add(leftCurb, rightCurb);

    // Flowering hedges & garden beds along both sides of the path
    const bushMat = new THREE.MeshStandardMaterial({
      color: "#4B6847",
      roughness: 0.9,
    });
    const blossomPalette = ["#F7F4EC", "#D89FA3", "#B9A7CE", "#F2D492"];
    for (let z = 24; z >= -4; z -= 2.8) {
      [-2.3, 2.3].forEach((x, side) => {
        const bush = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.45 + ((z + side) % 2) * 0.12, 1),
          bushMat
        );
        bush.position.set(x, 0.3, z);
        bush.scale.set(1.2, 0.75, 1.2);
        bush.castShadow = true;
        scene.add(bush);

        for (let b = 0; b < 3; b++) {
          const bloom = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 6, 6),
            new THREE.MeshStandardMaterial({
              color: blossomPalette[(Math.abs(Math.round(z)) + b) % 4],
            })
          );
          bloom.position.set(
            x + (b - 1) * 0.22,
            0.52 + (b % 2) * 0.08,
            z + (side === 0 ? 0.15 : -0.15)
          );
          scene.add(bloom);
        }
      });
    }

    // Organic multi-canopy oak & cypress trees
    const trunkMat = new THREE.MeshStandardMaterial({
      color: "#5D4B3E",
      roughness: 0.95,
    });
    const canopyMats = [
      new THREE.MeshStandardMaterial({ color: "#446042", roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: "#557250", roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: "#64825D", roughness: 0.85 }),
    ];

    const treeCoords = [
      [-6.5, 24],
      [6.8, 22],
      [-7.2, 16],
      [7.0, 14],
      [-6.4, 8],
      [6.6, 6],
      [-7.5, -2],
      [7.4, -3],
    ];

    treeCoords.forEach(([tx, tz], idx) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.34, 2.8, 10),
        trunkMat
      );
      trunk.position.y = 1.4;
      trunk.castShadow = true;
      tree.add(trunk);

      const offsets = [
        [0, 3.6, 0, 1.45],
        [-0.85, 3.1, 0.45, 1.1],
        [0.9, 3.2, -0.35, 1.15],
        [0.2, 4.3, 0.3, 1.05],
      ];
      offsets.forEach(([ox, oy, oz, rad], cIdx) => {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(rad, 1),
          canopyMats[(idx + cIdx) % canopyMats.length]
        );
        puff.position.set(ox, oy, oz);
        puff.castShadow = true;
        tree.add(puff);
      });

      tree.position.set(tx, 0, tz);
      scene.add(tree);
    });

    // Cemetery benches along the pathway
    const woodMat = new THREE.MeshStandardMaterial({ color: "#785C45" });
    const ironMat = new THREE.MeshStandardMaterial({ color: "#2B2B29" });
    [
      [-2.8, 13, Math.PI / 2],
      [2.8, 6, -Math.PI / 2],
    ].forEach(([bx, bz, rot]) => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.48), woodMat);
      seat.position.y = 0.45;
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.08), woodMat);
      back.position.set(0, 0.72, -0.2);
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.44), ironMat);
      legL.position.set(-0.62, 0.22, 0);
      const legR = legL.clone();
      legR.position.x = 0.62;
      bench.add(seat, back, legL, legR);
      bench.position.set(bx, 0, bz);
      bench.rotation.y = rot;
      scene.add(bench);
    });

    // Neighbouring monuments
    const neighbourMat = new THREE.MeshStandardMaterial({
      color: "#D9D4C8",
      roughness: 0.7,
    });
    [
      [-4.4, 19],
      [4.4, 19],
      [-4.4, 11],
      [4.4, 11],
      [-4.4, 3],
      [4.4, 3],
    ].forEach(([nx, nz]) => {
      const nStone = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 1.4, 0.28),
        neighbourMat
      );
      nStone.position.set(nx, 0.7, nz);
      nStone.castShadow = true;
      scene.add(nStone);
    });

    // Target Personalised 3D Headstone
    const headstoneHex =
      plot.headstone_color === "Charcoal Granite"
        ? "#2B2B29"
        : plot.headstone_color === "Ivory Marble"
        ? "#F8F6F1"
        : "#E4DFD2";
    const textHex =
      plot.headstone_color === "Charcoal Granite" ? "#F8F7F3" : "#202020";

    const stoneGroup = new THREE.Group();
    stoneGroup.position.set(0, 0, 0);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.24, 0.82),
      new THREE.MeshStandardMaterial({ color: "#C6C0B2", roughness: 0.75 })
    );
    plinth.position.y = 0.12;
    plinth.receiveShadow = true;
    stoneGroup.add(plinth);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 512;
    texCanvas.height = 512;
    const ctx = texCanvas.getContext("2d")!;
    ctx.fillStyle = headstoneHex;
    ctx.fillRect(0, 0, 512, 512);
    // Subtle stone grain
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = "rgba(150,140,125,0.08)";
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 2);
    }

    ctx.strokeStyle = "#B6A995";
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, 464, 464);

    ctx.fillStyle = textHex;
    ctx.textAlign = "center";
    ctx.font = "600 32px Georgia, serif";
    ctx.fillText(plot.deceased_name, 256, 165, 420);

    const birth = plot.date_of_birth ? plot.date_of_birth.slice(0, 4) : "";
    const death = plot.date_of_death ? plot.date_of_death.slice(0, 4) : "";
    if (birth || death) {
      ctx.font = "400 22px Inter, sans-serif";
      ctx.fillText(`${birth} - ${death}`, 256, 215, 400);
    }

    ctx.font = "italic 20px Georgia, serif";
    const words = plot.inscription.split(" ");
    let line = "";
    let y = 285;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (test.length > 32) {
        ctx.fillText(line, 256, y, 420);
        line = w;
        y += 30;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 256, y, 420);

    ctx.font = "400 15px monospace";
    ctx.fillStyle = "#8C867B";
    ctx.fillText(plot.plot_reference, 256, 455);

    const faceTex = new THREE.CanvasTexture(texCanvas);
    const sideMat = new THREE.MeshStandardMaterial({
      color: headstoneHex,
      roughness: 0.65,
    });
    const frontMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.6,
    });

    const monument = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.0, 0.34), [
      sideMat,
      sideMat,
      sideMat,
      sideMat,
      frontMat,
      sideMat,
    ]);
    monument.position.y = 1.22;
    monument.castShadow = true;
    stoneGroup.add(monument);

    // 3D Flowers at base of headstone
    const flowerCount = Math.max(2, Math.min(flowers.length + 2, 7));
    for (let i = 0; i < flowerCount; i++) {
      const blossom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.11, 1),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? "#FAF8F2" : "#D4A5A5",
          roughness: 0.6,
        })
      );
      blossom.position.set(-0.65 + i * 0.22, 0.3, 0.48);
      stoneGroup.add(blossom);
    }

    scene.add(stoneGroup);

    // Soft golden sunlight particles
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 90;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = 0.6 + Math.random() * 4.5;
      positions[i * 3 + 2] = Math.random() * 28 - 2;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: "#FFF7DC",
        size: 0.08,
        transparent: true,
        opacity: 0.65,
      })
    );
    scene.add(particles);

    const startZ = 28;
    const endZ = 4.2;
    const durationMs = walkDurationSec * 1000;
    const startTime = performance.now();
    let frameId = 0;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleCanvasClick = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObject(monument, false).length > 0) {
        onArrive();
      }
    };

    const handlePointerMove = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      renderer.domElement.style.cursor =
        raycaster.intersectObject(monument, false).length > 0
          ? "pointer"
          : "default";
    };

    renderer.domElement.addEventListener("click", handleCanvasClick);
    renderer.domElement.addEventListener("mousemove", handlePointerMove);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      camera.position.z = startZ + (endZ - startZ) * eased;
      camera.position.y = 1.68 + Math.sin(elapsed * 0.004) * 0.025 * (1 - t);
      camera.lookAt(0, 1.2, 0);

      particles.rotation.y = elapsed * 0.00004;

      setProgress(Math.round(t * 100));
      if (t >= 1) setArrived(true);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.dispose();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [plot, flowers, walkDurationSec, onArrive]);

  function toggleSound() {
    if (muted) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx();
          const gain = ctx.createGain();
          gain.gain.value = 0.035;
          gain.connect(ctx.destination);
          [220, 277.18, 329.63].forEach((f) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = f;
            osc.connect(gain);
            osc.start();
          });
          audioCtxRef.current = ctx;
          gainRef.current = gain;
        }
        if (gainRef.current) gainRef.current.gain.value = 0.035;
        setMuted(false);
      } catch {
        setMuted(true);
      }
    } else {
      if (gainRef.current) gainRef.current.gain.value = 0;
      setMuted(true);
    }
  }

  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden shadow-sm">
      <div className="relative w-full h-[400px] sm:h-[480px] bg-[#DCE5DF]">
        <div ref={containerRef} className="w-full h-full" />

        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 border border-[#E8E6E0] rounded-full px-2.5 py-1 text-[11px]">
          <span className="text-[#77746F] pl-1">Walk:</span>
          {([10, 30, 60, 120] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setWalkDurationSec(sec)}
              className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
                walkDurationSec === sec
                  ? "bg-[#242424] text-white"
                  : "text-[#77746F] hover:text-[#202020]"
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleSound}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-[#E8E6E0] text-xs font-medium text-[#202020]"
        >
          {muted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#77746F]" />
              <span>Sound off</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#718875]" />
              <span>Ambient on</span>
            </>
          )}
        </button>

        <div className="absolute bottom-4 left-4 right-4 bg-white/92 backdrop-blur-sm border border-[#E8E6E0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#77746F]">
              {arrived
                ? `Arrived at ${plot.section_name}`
                : `Walking along ${plot.pathway_template} (${progress}%)`}
            </p>
            <p className="font-editorial text-lg text-[#202020]">
              {plot.deceased_name} ({plot.plot_reference})
            </p>
            {arrived && (
              <p className="text-[11px] text-[#718875]">
                Click the 3D headstone or button to play the memorial video
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onArrive}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>
                {arrived
                  ? "Play Memorial Video"
                  : "Skip Walk, Go to Headstone"}
              </span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-full border border-[#E8E6E0] bg-white text-xs text-[#77746F]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
