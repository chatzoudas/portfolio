import { Html, Environment, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { Vector3, Mesh, Raycaster, Vector2, MeshBasicMaterial, BackSide } from 'three';
import gsap from 'gsap';
import VhsOverlay from './vhs-overlay';

export default function Model({
  onCameraReset,
  onProgress,
  onIframeMounted,
  onIframeLoaded,
  showEffects = true,
}: {
  onCameraReset?: (resetFn: () => void) => void;
  onProgress?: (p: number) => void;
  onIframeMounted?: () => void;
  onIframeLoaded?: () => void;
  showEffects?: boolean;
}) {
  const model = useGLTF('main.glb');
  const screen = model.scene.getObjectByName('Screen');
  const { camera, gl } = useThree();

  const { progress } = useProgress();
  useEffect(() => {
    onProgress?.(Math.round(progress));
  }, [progress, onProgress]);

  const handleCameraReset = useCallback(() => {
    const close = camera.position.distanceTo(new Vector3(0, 0, 2)) < 0.01;

    if (close == true) {
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 6,
        duration: 1,
        ease: "power2.inOut"
      });
    } else {
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 2,
        duration: 1,
        ease: "power2.inOut"
      });
    }
  }, [camera.position]);

  useEffect(() => {
    if (onCameraReset) {
      onCameraReset(handleCameraReset);
    }
  }, [onCameraReset, handleCameraReset]);

  const animateButtonPress = useCallback((keyName: string) => {
    const obj = model.scene.getObjectByName(keyName);

    if (obj && (obj as Mesh).isMesh) {
      const mesh = obj as Mesh;
      const originalY = mesh.position.y;

      gsap.to(mesh.position, {
        y: originalY - 0.01,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(mesh.position, {
            y: originalY,
            duration: 0.1,
            ease: "power2.out"
          });
        }
      });
    }
  }, [model.scene]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const audio = new Audio('/SoundEffects/keyboard-click.mp3');
      audio.volume = 0.05;
      audio.play().catch((err) => console.warn('Audio play failed', err));

      let keyName = `key_${e.key.toLowerCase()}`;
      if (keyName == "key_ ") {
        keyName = "key_space";
      }
      animateButtonPress(keyName);
    };

    window.addEventListener("keydown", handleKeyPress);

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'keydown' && e.source === iframeRef.current?.contentWindow) {
        const audio = new Audio('/SoundEffects/keyboard-click.mp3');
        audio.volume = 0.05;
        audio.play().catch((err) => console.warn('Audio play failed', err));

        let keyName = `key_${e.data.key.toLowerCase()}`;
        if (keyName == "key_ ") {
          keyName = "key_space";
        }
        animateButtonPress(keyName);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener('message', handleMessage);
    };
  }, [animateButtonPress]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeMountedCalled = useRef(false);

  useEffect(() => {
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) {
        const audio = new Audio('/SoundEffects/mouse-click.mp3');
        audio.volume = 0.03;
        audio.play().catch((err) => console.warn('Audio play failed', err));
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (screen && iframeRef.current && !iframeMountedCalled.current) {
      iframeMountedCalled.current = true;
      onIframeMounted?.();
    }
  }, [screen, onIframeMounted]);

  useEffect(() => {
    if (!model || !gl || !camera) return;

    const canvas = gl.domElement;
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const stickerNames = ['Sticker_github', 'Sticker_linkedin', 'Sticker_mail'];
    const urlMap: Record<string, string> = {
      Sticker_github: 'https://github.com/chatzoudas',
      Sticker_linkedin: 'https://www.linkedin.com/in/nick-chatzoudas/',
      Sticker_mail: 'mailto:nikoschatzoudas@gmail.com',
    };

    const stickerObjs: Mesh[] = [];
    const outlines: Mesh[] = [];

    for (const name of stickerNames) {
      const obj = model.scene.getObjectByName(name) as Mesh | undefined;
      if (obj && obj.isMesh) {
        stickerObjs.push(obj);

        const mat = new MeshBasicMaterial({ color: 0xf5f2d7, side: BackSide, transparent: true, opacity: 0 });
        const outline = new Mesh(obj.geometry, mat);
        outline.scale.set(1.05, 1.05, 1.05);
        outline.visible = false;
        obj.add(outline);
        outlines.push(outline);
      }
    }

    if (stickerObjs.length === 0) {
      return () => { };
    }

    const setPointerFromEvent = (e: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const findStickerRootName = (obj: any) => {
      let cur: any = obj;
      while (cur) {
        if (stickerNames.includes(cur.name)) return cur.name;
        cur = cur.parent;
      }
      return null;
    };

    const showOutline = (outline: Mesh) => {
      outline.visible = true;
      gsap.killTweensOf(outline.material);
      gsap.to(outline.material as any, { opacity: 1, duration: 0.0, ease: 'power2.out' });
    };

    const hideOutline = (outline: Mesh) => {
      gsap.killTweensOf(outline.material);
      gsap.to(outline.material as any, {
        opacity: 0,
        duration: 0,
        ease: 'power2.in',
        onComplete: () => {
          outline.visible = false;
        }
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(stickerObjs, true);
      if (intersects.length > 0) {
        const hitName = findStickerRootName(intersects[0].object);
        canvas.style.cursor = 'pointer';
        for (let i = 0; i < stickerObjs.length; i++) {
          const s = stickerObjs[i];
          const out = outlines[i];
          if (s.name === hitName) {
            showOutline(out);
          } else {
            if ((out.material as any).opacity > 0) hideOutline(out);
          }
        }
      } else {
        canvas.style.cursor = 'default';
        for (const out of outlines) {
          if ((out.material as any).opacity > 0) hideOutline(out);
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(stickerObjs, true);
      if (intersects.length > 0) {
        const hitName = findStickerRootName(intersects[0].object);
        const url = hitName ? urlMap[hitName] : undefined;
        if (url) {
          window.open(url, '_blank');
        }
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('click', onClick);
      for (const out of outlines) {
        out.removeFromParent();

        (out.material as MeshBasicMaterial).dispose();
      }
      canvas.style.cursor = 'default';
      if (typeof (raycaster as any).dispose === 'function') {
        (raycaster as any).dispose();
      }
    };
  }, [model, gl, camera]);



  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {

      if (e.data === 'click' && e.source === iframeRef.current?.contentWindow) {
        const audio = new Audio('/SoundEffects/mouse-click.mp3');
        audio.volume = 0.03;
        audio.play().catch((err) => console.warn('Audio play failed', err));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      <Environment preset="city" />
      <primitive object={model.scene} />
      {screen && (
        <Html
          transform
          occlude
          wrapperClass="model-fullscreen"
          distanceFactor={0.5}
          position={[
            screen.position.x,
            screen.position.y,
            screen.position.z + 0.001,
          ]}
        >
          <div className="crt-frame">
            <iframe className='nodisplay' ref={iframeRef} src="https://os.chatzoudas.dev" onLoad={() => onIframeLoaded?.()} />
            {showEffects && <VhsOverlay className="vhs-overlay" />}
          </div>
        </Html>
      )}
      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={2}
      />
    </>
  );
}
