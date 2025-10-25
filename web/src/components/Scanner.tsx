"use client";
import React from "react";

type ScanState = "idle" | "scanning" | "found" | "error";

export default function Scanner({ onCode }: { onCode: (qr: string) => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [state, setState] = React.useState<ScanState>("idle");
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [hasTorch, setHasTorch] = React.useState(false);
  const [torchOn, setTorchOn] = React.useState(false);
  const [cameraIds, setCameraIds] = React.useState<string[]>([]);
  const [cameraIdx, setCameraIdx] = React.useState(0);

  const BarcodeDetectorAny: any = (globalThis as any).BarcodeDetector;

  async function start(camDeviceId?: string) {
    try {
      const constraints: MediaStreamConstraints = {
        video: camDeviceId
          ? { deviceId: { exact: camDeviceId } }
          : { facingMode: { ideal: "environment" } },
        audio: false,
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      const video = videoRef.current!;
      video.srcObject = s;
      await video.play();
      setState("scanning");

      // detect torch support
      const track = s.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() || {}) as any;
      setHasTorch(!!caps.torch);

      // discover cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => d.deviceId);
      setCameraIds(cams);

      // scanning loop
      const detector =
        BarcodeDetectorAny && new BarcodeDetectorAny({ formats: ["qr_code"] });
      if (detector) {
        const loop = async () => {
          if (state !== "scanning") return;
          try {
            const codes = await detector.detect(video);
            if (codes?.[0]?.rawValue) {
              setState("found");
              vibration();
              onCode(codes[0].rawValue);
              return;
            }
          } catch {
            /* ignore */
          }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      } else {
        // TODO: fallback to @zxing/browser or jsQR (canvas decode). Keep behind a dynamic import.
        console.warn(
          "BarcodeDetector not available. Provide a library fallback."
        );
      }
    } catch (e) {
      setState("error");
      console.error(e);
    }
  }

  function stop() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setState("idle");
  }

  async function toggleTorch() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0] as any;
    await track.applyConstraints?.({ advanced: [{ torch: !torchOn }] });
    setTorchOn((v) => !v);
  }

  async function switchCamera() {
    if (!cameraIds.length) return;
    const next = (cameraIdx + 1) % cameraIds.length;
    setCameraIdx(next);
    stop();
    start(cameraIds[next]);
  }

  return (
    <div className="card p-4">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />
        {/* framing guide */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-white/20" />
        {/* vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,.45))]" />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {state !== "scanning" ? (
          <button
            className="btn-primary px-4 py-2 rounded-xl"
            onClick={() => start()}
          >
            Start scanning
          </button>
        ) : (
          <button className="btn-outline px-4 py-2 rounded-xl" onClick={stop}>
            Stop
          </button>
        )}
        {hasTorch && state === "scanning" && (
          <button
            className="btn-outline px-3 py-2 rounded-xl"
            onClick={toggleTorch}
          >
            {torchOn ? "Torch off" : "Torch on"}
          </button>
        )}
        {cameraIds.length > 1 && state === "scanning" && (
          <button
            className="btn-outline px-3 py-2 rounded-xl"
            onClick={switchCamera}
          >
            Switch camera
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-sm text-white/70">
        {state === "idle" && "Start camera to scan a ticket QR."}
        {state === "scanning" && "Align the QR within the frame."}
        {state === "found" && "Processing…"}
        {state === "error" &&
          "Camera error. Check permissions or try manual entry."}
      </p>

      <div className="mt-3 text-center text-xs text-white/60">
        <button
          className="underline decoration-white/30 underline-offset-2"
          onClick={() => {
            /* open manual entry modal */
          }}
        >
          Enter code instead
        </button>
      </div>
    </div>
  );
}

function vibration() {
  try {
    navigator.vibrate?.(120);
  } catch {}
}
