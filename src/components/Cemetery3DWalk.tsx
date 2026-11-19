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

export function Cemetery3DWalk({
  plot,
  flowers = [],
  onArrive,
  onCancel,
}: Cemetery3DWalkProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#E8ECE6");
    scene.fog = new THREE.FogExp2("#E8ECE6", 0.022);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 120);
    camera.position.set(0, 1.65, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Warm afternoon daylight
    const hemi = new THREE.HemisphereLight("#FFFDF7", "#6B7C67", 1.15);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight("#FFF5E1", 1.35);
    sun.position.set(14, 22, 16);
    sun.castShadow = true;
    scene.add(sun);

    // Landscaped lawn
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshLambertMaterial({ color: "#889B82" })
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    scene.add(lawn);

    // Paved pathway
    const pathColor = plot.pathway_template.includes("Brick")
      ? "#A67B68"
      : plot.pathway_template.includes("Gravel")
      ? "#D5CFC3"
      : "#CFCBC2";

    const pathway = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 70),
      new THREE.MeshLambertMaterial({ color: pathColor })
    );
    pathway.rotation.x = -Math.PI / 2;
    pathway.position.y = 0.015;
    pathway.receiveShadow = true;
    scene.add(pathway);

    // Pathway stone borders
    const curbGeo = new THREE.BoxGeometry(0.14, 0.08, 70);
    const curbMat = new THREE.MeshLambertMaterial({ color: "#B9B3A6" });
    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-1.65, 0.04, 0);
    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(1.65, 0.04, 0);
    scene.add(leftCurb, rightCurb);

    // Trees lining the grounds
    const trunkMat = new THREE.MeshLambertMaterial({ color: "#6E5A4B" });
    const leafMat1 = new THREE.MeshLambertMaterial({ color: "#586F55" });
    const leafMat2 = new THREE.MeshLambertMaterial({ color: "#688064" });

    const treePositions = [
      [-6.5, 22],
      [6.8, 20],
      [-7.5, 13],
      [7.2, 11],
      [-6.2, 4],
      [6.4, 3],
      [-8.5, -5],
      [8.0, -6],
    ];

    treePositions.forEach(([tx, tz], idx) => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.28, 2.2, 8),
        trunkMat
      );
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      group.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(idx % 2 === 0 ? 1.4 : 1.7, 4.4, 9),
        idx % 2 === 0 ? leafMat1 : leafMat2
      );
      canopy.position.y = 3.8;
      canopy.castShadow = true;
      group.add(canopy);

      group.position.set(tx, 0, tz);
      scene.add(group);
    });

    // Neighbouring headstones along the rows
    const neighbourMat = new THREE.MeshLambertMaterial({ color: "#D9D4C8" });
    const neighbourGeo = new THREE.BoxGeometry(1.1, 1.35, 0.25);
    const neighbourCoords = [
      [-3.8, 17],
      [3.8, 17],
      [-3.8, 10],
      [3.8, 10],
      [-3.8, 2],
      [3.8, 2],
    ];
    neighbourCoords.forEach(([nx, nz]) => {
      const stone = new THREE.Mesh(neighbourGeo, neighbourMat);
      stone.position.set(nx, 0.68, nz);
      stone.castShadow = true;
      scene.add(stone);
    });

    // Target Personalised 3D Headstone
    const headstoneHex =
      plot.headstone_color === "Charcoal Granite"
        ? "#2C2C2A"
        : plot.headstone_color === "Ivory Marble"
        ? "#FAF9F6"
        : "#E6E1D5";
    const textHex =
      plot.headstone_color === "Charcoal Granite" ? "#F8F7F3" : "#202020";

    const stoneGroup = new THREE.Group();
    stoneGroup.position.set(0, 0, 0);

    // Base plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.22, 0.7),
      new THREE.MeshLambertMaterial({ color: "#C8C2B5" })
    );
    plinth.position.y = 0.11;
    plinth.receiveShadow = true;
    stoneGroup.add(plinth);

    // Engraved canvas texture for the headstone face
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 512;
    texCanvas.height = 512;
    const ctx = texCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = headstoneHex;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = "#B6A995";
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, 464, 464);

      ctx.fillStyle = textHex;
      ctx.textAlign = "center";
      ctx.font = "600 32px Georgia, serif";
      ctx.fillText(plot.deceased_name, 256, 170, 420);

      const birth = plot.date_of_birth ? plot.date_of_birth.slice(0, 4) : "";
      const death = plot.date_of_death ? plot.date_of_death.slice(0, 4) : "";
      if (birth || death) {
        ctx.font = "400 22px Inter, sans-serif";
        ctx.fillText(`${birth} – ${death}`, 256, 220, 400);
      }

      ctx.font = "italic 20px Georgia, serif";
      const words = plot.inscription.split(" ");
      let line = "";
      let y = 290;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (test.length > 34) {
          ctx.fillText(line, 256, y, 420);
          line = w;
          y += 30;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, 256, y, 420);

      ctx.font = "400 16px monospace";
      ctx.fillStyle = "#8C867B";
      ctx.fillText(plot.plot_reference, 256, 455);
    }

    const faceTex = new THREE.CanvasTexture(texCanvas);
    const sideMat = new THREE.MeshLambertMaterial({ color: headstoneHex });
    const frontMat = new THREE.MeshLambertMaterial({ map: faceTex });

    const monument = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.9, 0.3), [
      sideMat,
      sideMat,
      sideMat,
      sideMat,
      frontMat,
      sideMat,
    ]);
    monument.position.y = 1.15;
    monument.castShadow = true;
    stoneGroup.add(monument);

    // 3D Flowers at base of headstone
    const flowerCount = Math.max(1, Math.min(flowers.length, 6));
    for (let i = 0; i < flowerCount; i++) {
      const blossom = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 10),
        new THREE.MeshLambertMaterial({
          color: i % 2 === 0 ? "#FAF8F2" : "#D4A5A5",
        })
      );
      blossom.position.set(-0.55 + i * 0.25, 0.28, 0.42);
      stoneGroup.add(blossom);
    }

    scene.add(stoneGroup);

    // Gentle guided walk animation
    const startZ = 26;
    const endZ = 4.1;
    const durationMs = 7500;
    const startTime = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Smooth ease-in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      camera.position.z = startZ + (endZ - startZ) * eased;
      camera.position.y = 1.62 + Math.sin(elapsed * 0.005) * 0.025 * (1 - t);
      camera.lookAt(0, 1.15, 0);

      setProgress(Math.round(t * 100));
      if (t >= 1) {
        setArrived(true);
      }

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
      renderer.dispose();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [plot, flowers]);

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
      <div className="relative w-full h-[380px] sm:h-[460px] bg-[#E8ECE6]">
        <div ref={containerRef} className="w-full h-full" />

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
                  ? "Open Headstone & Life Memories"
                  : "Skip Walk — Go to Grave"}
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
