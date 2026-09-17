"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

interface CustomShape {
  body: Matter.Body;
  type: "yellow_hex" | "blue_wavy" | "purple_dome" | "orange_clover" | "pink_cloud" | "lime_clover" | "pill_text";
  color: string;
  size: number;
  text?: string;
  w?: number;
  h?: number;
}

export default function PhysicsPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // High DPI scaling
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const width = container.clientWidth || 1200;
    const height = 480;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Matter.js Aliases
    const { Engine, Bodies, Body, Composite } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.15, scale: 0.001 },
    });
    const world = engine.world;

    // Boundaries: Floor right at bottom baseline, side walls, and ceiling
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      friction: 0.4,
      restitution: 0.4,
    };

    const floor = Bodies.rectangle(width / 2, height + 25, width * 2, 50, wallOptions);
    const leftWall = Bodies.rectangle(-30, height / 2, 60, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height * 2, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -200, width * 2, 60, wallOptions);

    Composite.add(world, [floor, leftWall, rightWall, ceiling]);

    const commonProps = {
      restitution: 0.45,
      friction: 0.25,
      frictionAir: 0.018,
      density: 0.002,
    };

    const physicsBodies: CustomShape[] = [];

    // Responsive horizontal positioning
    const step = width / 7;

    // 1. YELLOW HEXAGON (Far Left)
    const hexX = Math.max(100, step * 0.75);
    const hexY = height - 130;
    const hexBody = Bodies.polygon(hexX, hexY, 6, 115, {
      ...commonProps,
      chamfer: { radius: 26 },
      angle: 0.08,
    });
    physicsBodies.push({ body: hexBody, type: "yellow_hex", color: "#FCE72D", size: 115 });

    // 2. BLUE WAVY STARBURST / SCALLOP (Next to Hexagon)
    const blueX = Math.max(250, step * 1.9);
    const blueY = height - 130;
    const blueBody = Bodies.circle(blueX, blueY, 115, {
      ...commonProps,
      angle: 0.25,
    });
    physicsBodies.push({ body: blueBody, type: "blue_wavy", color: "#5483F6", size: 115 });

    // 3. PERIWINKLE DOME (Hanging / Upper center-left)
    const domeX = Math.max(380, step * 2.9);
    const domeY = height - 260;
    const domeBody = Bodies.circle(domeX, domeY, 100, {
      ...commonProps,
      angle: -0.05,
    });
    physicsBodies.push({ body: domeBody, type: "purple_dome", color: "#95A8FE", size: 100, w: 210, h: 140 });

    // 4. ORANGE ORGANIC 4-LOBED CROSS / CLOVER (Center)
    const orangeX = Math.max(530, step * 4.0);
    const orangeY = height - 150;
    const orangeBody = Bodies.circle(orangeX, orangeY, 125, {
      ...commonProps,
      angle: 0.1,
    });
    physicsBodies.push({ body: orangeBody, type: "orange_clover", color: "#FF7B47", size: 125 });

    // 5. PINK SCALLOP CLOUD (Upper center-right)
    const pinkX = Math.max(680, step * 5.1);
    const pinkY = height - 250;
    const pinkBody = Bodies.rectangle(pinkX, pinkY, 230, 140, {
      ...commonProps,
      chamfer: { radius: 40 },
      angle: -0.12,
    });
    physicsBodies.push({ body: pinkBody, type: "pink_cloud", color: "#FFAFF6", size: 110, w: 230, h: 140 });

    // 6. LIME GREEN 4-LEAF CLOVER (Far Right)
    const limeX = Math.max(830, step * 6.2);
    const limeY = height - 150;
    const limeBody = Bodies.circle(limeX, limeY, 120, {
      ...commonProps,
      angle: -0.15,
    });
    physicsBodies.push({ body: limeBody, type: "lime_clover", color: "#C6EB3D", size: 120 });

    // 7. GREEN TEXT CAPSULE PILLS (Floating & resting as shown in screenshot)
    // Pill 1: "Join our WhatsApp Community"
    const p1 = Bodies.rectangle(150, 90, 230, 50, {
      ...commonProps,
      chamfer: { radius: 25 },
      angle: -0.42,
    });
    physicsBodies.push({
      body: p1,
      type: "pill_text",
      color: "#2BD980",
      size: 50,
      w: 230,
      h: 50,
      text: "Join our WhatsApp Community",
    });

    // Pill 2: "Become a Trusted Tester"
    const p2 = Bodies.rectangle(260, 110, 210, 50, {
      ...commonProps,
      chamfer: { radius: 25 },
      angle: 1.18,
    });
    physicsBodies.push({
      body: p2,
      type: "pill_text",
      color: "#2BD980",
      size: 50,
      w: 210,
      h: 50,
      text: "Become a Trusted Tester",
    });

    // Pill 3: "Follow on Instagram & LinkedIn"
    const p3 = Bodies.rectangle(width - 160, 80, 230, 50, {
      ...commonProps,
      chamfer: { radius: 25 },
      angle: -0.52,
    });
    physicsBodies.push({
      body: p3,
      type: "pill_text",
      color: "#2BD980",
      size: 50,
      w: 230,
      h: 50,
      text: "Follow on Instagram & LinkedIn",
    });

    // Pill 4: "Sign up for the GDG newsletter"
    const p4 = Bodies.rectangle(width - 140, 150, 240, 50, {
      ...commonProps,
      chamfer: { radius: 25 },
      angle: 0.68,
    });
    physicsBodies.push({
      body: p4,
      type: "pill_text",
      color: "#2BD980",
      size: 50,
      w: 240,
      h: 50,
      text: "Sign up for the GDG newsletter",
    });

    // Add all to physics world
    Composite.add(
      world,
      physicsBodies.map((p) => p.body)
    );

    // =========================================================================
    // HOVER-BASED KINETIC FORCE ENGINE
    // =========================================================================
    const mouseState = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      active: false,
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      if (mouseState.prevX !== -1000) {
        mouseState.vx = (currentX - mouseState.prevX) * 0.5;
        mouseState.vy = (currentY - mouseState.prevY) * 0.5;
      }

      mouseState.prevX = currentX;
      mouseState.prevY = currentY;
      mouseState.x = currentX;
      mouseState.y = currentY;
      mouseState.active = true;

      setInteracted(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onPointerLeave = () => {
      mouseState.active = false;
      mouseState.prevX = -1000;
      mouseState.prevY = -1000;
      mouseState.vx = 0;
      mouseState.vy = 0;
    };

    container.addEventListener("mousemove", onMouseMove, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("mouseleave", onPointerLeave);
    container.addEventListener("touchend", onPointerLeave);

    // Canvas Render Loop
    const ctx = canvas.getContext("2d");
    let animationFrameId: number;

    const render = () => {
      // Hover kinetic interaction
      if (mouseState.active) {
        const hoverRadius = 240;

        physicsBodies.forEach(({ body, size }) => {
          const dx = body.position.x - mouseState.x;
          const dy = body.position.y - mouseState.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const effectiveRadius = hoverRadius + size * 0.45;

          if (dist < effectiveRadius && dist > 0) {
            const factor = 1 - dist / effectiveRadius;
            const nx = dx / dist;
            const ny = dy / dist;

            const upwardLift = -factor * 0.09;
            const pushX = nx * factor * 0.07 + mouseState.vx * 0.008;
            const pushY = Math.min(-0.02, ny * factor * 0.035 + upwardLift + mouseState.vy * 0.008);

            Body.applyForce(body, body.position, { x: pushX, y: pushY });

            const torque = (nx > 0 ? 0.03 : -0.03) * factor;
            Body.setAngularVelocity(body, body.angularVelocity * 0.94 + torque);
          }
        });

        mouseState.vx *= 0.85;
        mouseState.vy *= 0.85;
      }

      Engine.update(engine, 1000 / 60);

      if (ctx) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        physicsBodies.forEach(({ body, type, color, size, text, w = 210, h = 50 }) => {
          const { x, y } = body.position;
          const angle = body.angle;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillStyle = color;

          if (type === "pill_text") {
            // Rounded green capsule
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
            } else {
              ctx.rect(-w / 2, -h / 2, w, h);
            }
            ctx.fill();

            // Text inside the pill
            if (text) {
              ctx.fillStyle = "#111111";
              ctx.font = "600 12.5px Inter, system-ui, -apple-system, sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(text, 0, 1);
            }
          } else if (type === "blue_wavy") {
            // Sinusoidal smooth wavy scallop badge (14 waves)
            const numWaves = 14;
            const baseR = size * 0.88;
            const amp = size * 0.12;
            const steps = 180;
            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
              const theta = (i / steps) * Math.PI * 2;
              const r = baseR + amp * Math.cos(numWaves * theta);
              const px = Math.cos(theta) * r;
              const py = Math.sin(theta) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          } else if (type === "orange_clover" || type === "lime_clover") {
            // 4-lobed rounded organic clover / cross
            const r = size * 0.48;
            const d = size * 0.42;
            ctx.beginPath();
            ctx.arc(0, -d, r, 0, Math.PI * 2);
            ctx.arc(d, 0, r, 0, Math.PI * 2);
            ctx.arc(0, d, r, 0, Math.PI * 2);
            ctx.arc(-d, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === "purple_dome") {
            // Periwinkle Dome: flat top with rounded corners, semicircular bowl bottom
            const domeW = w;
            const domeH = h;
            ctx.beginPath();
            ctx.moveTo(-domeW / 2 + 18, -domeH / 2);
            ctx.lineTo(domeW / 2 - 18, -domeH / 2);
            ctx.quadraticCurveTo(domeW / 2, -domeH / 2, domeW / 2, -domeH / 2 + 18);
            ctx.bezierCurveTo(domeW / 2, domeH / 2 + 15, -domeW / 2, domeH / 2 + 15, -domeW / 2, -domeH / 2 + 18);
            ctx.quadraticCurveTo(-domeW / 2, -domeH / 2, -domeW / 2 + 18, -domeH / 2);
            ctx.closePath();
            ctx.fill();
          } else if (type === "pink_cloud") {
            // Pink Scallop Cloud: stylized multi-arc cloud
            const cw = w;
            const ch = h;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 44);
            } else {
              ctx.rect(-cw / 2, -ch / 2, cw, ch);
            }
            ctx.fill();
            // Side & top scalloped mounding
            ctx.beginPath();
            ctx.arc(-cw * 0.25, -ch * 0.45, 34, 0, Math.PI * 2);
            ctx.arc(cw * 0.25, -ch * 0.45, 34, 0, Math.PI * 2);
            ctx.arc(-cw * 0.25, ch * 0.45, 34, 0, Math.PI * 2);
            ctx.arc(cw * 0.25, ch * 0.45, 34, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Yellow Hexagon: chamfered polygon vertices
            ctx.beginPath();
            const vertices = body.vertices;
            if (vertices.length > 0) {
              ctx.moveTo(vertices[0].x - x, vertices[0].y - y);
              for (let j = 1; j < vertices.length; j++) {
                ctx.lineTo(vertices[j].x - x, vertices[j].y - y);
              }
              ctx.closePath();
              ctx.fill();
            }
          }

          ctx.restore();
        });

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!container || !canvas) return;
      const newWidth = container.clientWidth;
      canvas.width = newWidth * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${height}px`;
      Body.setPosition(floor, { x: newWidth / 2, y: height + 25 });
      Body.setPosition(rightWall, { x: newWidth + 30, y: height / 2 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("mouseleave", onPointerLeave);
      container.removeEventListener("touchend", onPointerLeave);
      window.removeEventListener("resize", handleResize);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none cursor-default bg-white"
      style={{ height: "480px" }}
    >
      {/* Interactive Hint */}
      {!interacted && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff]/90 backdrop-blur-xs border border-[#111111]/15 text-xs font-medium text-[#111111] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2BD980] animate-pulse" />
            <span>Hover to tumble &amp; stir GDG AJCE blocks</span>
          </div>
        </div>
      )}

      {/* Physics Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
