import "./App.css";
import { AnimatedBackground } from "./components/animated-background";

import { Canvas } from '@react-three/fiber';
import Model from "./components/Model";

import Controller from "./components/controller";
import { useCallback, useEffect, useRef, useState } from "react";

import Loader from "./components/loader";

function App() {
  const [resetCamera, setResetCamera] = useState<(() => void)>(() => () => { });
  const [isRainbowMode, setIsRainbowMode] = useState(false);

  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) {
      window.location.href = "https://os.chatzoudas.dev/?mobile=true";
    }
  }, []);

  const handleCameraReset = useCallback((handler: () => void) => {
    setResetCamera(() => handler);
  }, []);

  const toggleRainbowMode = useCallback(() => {
    setIsRainbowMode(prev => !prev);
  }, []);

  const [modelProgress, setModelProgress] = useState<number>(0);
  const [iframeMounted, setIframeMounted] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  const [iframeProgress, setIframeProgress] = useState<number>(0);

  useEffect(() => {
    if (!iframeMounted || iframeLoaded) return;

    setIframeProgress(prev => Math.max(prev, 10));

    const interval = setInterval(() => {
      setIframeProgress(prev => {
        const next = Math.min(95, prev + Math.random() * 6 + 2);
        return Math.round(next);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [iframeMounted, iframeLoaded]);

  useEffect(() => {
    if (iframeLoaded) {
      setIframeProgress(100);
    }
  }, [iframeLoaded]);

  const targetCombined = Math.round(modelProgress * 0.8 + iframeProgress * 0.2);

  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<number>(targetCombined);
  targetRef.current = targetCombined;

  useEffect(() => {
    const tick = () => {
      setDisplayProgress(prev => {
        const target = targetRef.current;
        if (prev === target) return prev;

        const diff = target - prev;
        if (Math.abs(diff) < 0.5) {
          return target;
        }

        const next = prev + diff * 0.18;
        return Math.round(next);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (displayProgress >= 100 && rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setDisplayProgress(100);
    }
  }, [displayProgress]);

  const allDone = modelProgress >= 100 && iframeLoaded;
  const showLoader = !allDone;

  useEffect(() => {
    if (!showLoader) {
      const iframe = document.querySelector('iframe.nodisplay');
      if (iframe) {
        iframe.classList.remove('nodisplay');
      }
    }
  }, [showLoader]);

  return (
    <div>
      <AnimatedBackground
        backgroundColor="#000000"
        colorFront="#0e1036"
        speed={isRainbowMode ? 2 : 0.3}
        shape="warp"
        type="4x4"
        rainbow={isRainbowMode}
      >
        {showLoader && <Loader progress={displayProgress} />}

        <div style={{ width: "100vw", height: "100vh" }}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 45 }}
          >
            <Model
              onCameraReset={handleCameraReset}
              onProgress={(p) => setModelProgress(p)}
              onIframeMounted={() => setIframeMounted(true)}
              onIframeLoaded={() => setIframeLoaded(true)}
              showEffects={!showLoader}
            />
          </Canvas>

        </div>
        <Controller
          onReset={resetCamera}
          onPartyToggle={toggleRainbowMode}
          isPartyMode={isRainbowMode}
        />
      </AnimatedBackground>
    </div>
  );
}

export default App;
