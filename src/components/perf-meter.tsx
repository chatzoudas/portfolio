import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { WebGLRenderer } from "three";
import { isPerfEnabled, formatLoadTime } from "../lib/perf-flag";
import "98.css";

export type PerfStats = {
  fps: number;
  avgFps: number;
  uptimeSec: number;
  ms: number;
  calls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  heapMB: number | null;
  dpr: number;
};

function getHeapMB(): number | null {
  const mem = (performance as unknown as { memory?: { usedJSHeapSize?: number } }).memory;
  if (mem?.usedJSHeapSize) return mem.usedJSHeapSize / 1024 / 1024;
  return null;
}

function rating(fps: number): { label: string; color: string } {
  if (fps >= 50) return { label: "SMOOTH", color: "#0a7d00" };
  if (fps >= 30) return { label: "OK", color: "#8a6d00" };
  return { label: "SLOW", color: "#b30000" };
}

export default function PerfMeter({
  rendererRef,
  loadMs,
}: {
  rendererRef: RefObject<WebGLRenderer | null>;
  loadMs?: number | null;
}) {
  const [enabled, setEnabled] = useState<boolean>(() => isPerfEnabled());
  const [stats, setStats] = useState<PerfStats>({
    fps: 0,
    avgFps: 0,
    uptimeSec: 0,
    ms: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0,
    geometries: 0,
    textures: 0,
    heapMB: null,
    dpr: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  });
  const accRef = useRef({ frames: 0, lastWindow: performance.now(), lastFrame: performance.now(), msSum: 0, msCount: 0 });
  const sessionRef = useRef({ totalFrames: 0, start: typeof performance !== "undefined" ? performance.now() : 0 });
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const sync = () => setEnabled(isPerfEnabled());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const acc = accRef.current;
    const session = sessionRef.current;
    acc.frames = 0;
    acc.lastWindow = performance.now();
    acc.lastFrame = performance.now();
    acc.msSum = 0;
    acc.msCount = 0;

    const loop = (now: number) => {
      const delta = now - acc.lastFrame;
      acc.lastFrame = now;
      if (delta < 250) {
        acc.msSum += delta;
        acc.msCount += 1;
      }
      acc.frames += 1;
      session.totalFrames += 1;

      if (now - acc.lastWindow >= 500 && enabledRef.current) {
        const elapsed = now - acc.lastWindow;
        const fps = (acc.frames * 1000) / elapsed;
        const ms = acc.msCount > 0 ? acc.msSum / acc.msCount : 1000 / Math.max(fps, 0.01);
        const sessionSec = Math.max((now - session.start) / 1000, 0.01);
        const avgFps = session.totalFrames / sessionSec;
        const gl = rendererRef.current;
        setStats({
          fps: Math.round(fps),
          avgFps: Math.round(avgFps * 10) / 10,
          uptimeSec: Math.round(sessionSec * 10) / 10,
          ms: Math.round(ms * 10) / 10,
          calls: gl?.info.render.calls ?? 0,
          triangles: gl?.info.render.triangles ?? 0,
          points: gl?.info.render.points ?? 0,
          lines: gl?.info.render.lines ?? 0,
          geometries: gl?.info.memory.geometries ?? 0,
          textures: gl?.info.memory.textures ?? 0,
          heapMB: getHeapMB(),
          dpr: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        });
        acc.frames = 0;
        acc.msSum = 0;
        acc.msCount = 0;
        acc.lastWindow = now;
      } else if (now - acc.lastWindow >= 500) {
        acc.frames = 0;
        acc.msSum = 0;
        acc.msCount = 0;
        acc.lastWindow = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rendererRef]);

  if (!enabled) return null;

  const r = rating(stats.fps);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="perf-meter window" role="status" aria-label="Performance meter">
      <div className="title-bar">
        <div className="title-bar-text">Performance</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => setEnabled(false)} />
        </div>
      </div>
      <div className="window-body">
        <div className="perf-row perf-head">
          <span className="perf-fps" style={{ color: r.color }}>
            {stats.fps} FPS
          </span>
          <span className="perf-badge" style={{ backgroundColor: r.color }}>
            {r.label}
          </span>
        </div>
        <div className="perf-grid">
          <span>Frame</span>
          <span>{stats.ms.toFixed(1)} ms</span>
          <span>Avg FPS</span>
          <span>{stats.avgFps.toFixed(1)}</span>
          <span>Uptime</span>
          <span>{stats.uptimeSec.toFixed(0)} s</span>
          <span>Loaded in</span>
          <span>{formatLoadTime(loadMs)}</span>
          <span>Calls</span>
          <span>{fmt(stats.calls)}</span>
          <span>Tris</span>
          <span>{fmt(stats.triangles)}</span>
          <span>Geos</span>
          <span>{fmt(stats.geometries)}</span>
          <span>Texs</span>
          <span>{fmt(stats.textures)}</span>
          <span>DPR</span>
          <span>{stats.dpr.toFixed(2)}</span>
          <span>Heap</span>
          <span>{stats.heapMB == null ? "n/a" : `${stats.heapMB.toFixed(0)} MB`}</span>
        </div>
      </div>
    </div>
  );
}
