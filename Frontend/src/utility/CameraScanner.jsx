import { useEffect, useRef, useState, useCallback, useId } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { commonComponentBG } from "../Theme/commonComponentBG";
import { commonFieldColour } from "../Theme/commonFieldColour";
import { PALETTE } from "../Theme/palette";
import { primaryButton } from "../Theme/primaryButton";

const CameraScanner = ({ onScanSuccess, onClose, type = "barcode" }) => {
  const rawId = useId();
  const regionId = `scanner-viewport-${rawId.replace(/:/g, "")}`;

  const scannerRef = useRef(null);
  const trackRef = useRef(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const hasScannedRef = useRef(false);

  const [status, setStatus] = useState("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const [facingMode, setFacingMode] = useState("environment");

  const stopCamera = useCallback(async () => {
    const html5QrCode = scannerRef.current;
    if (html5QrCode) {
      try {
        if (html5QrCode.isScanning) {
          await html5QrCode.stop();
        }
        html5QrCode.clear();
      } catch (e) {
        console.warn("Scanner shutdown bypassed:", e);
      }
      scannerRef.current = null;
    }
    if (trackRef.current) {
      trackRef.current.forEach((track) => track.stop());
      trackRef.current = null;
    }
    setTorchSupported(false);
    setTorchOn(false);
  }, []);

  const handleDecoded = useCallback(
    async (decodedText) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;
      await stopCamera();
      onScanSuccess(decodedText);
    },
    [onScanSuccess, stopCamera],
  );

  useEffect(() => {
    isMountedRef.current = true;
    hasScannedRef.current = false;

    let formatsToSupport = [];
    if (type === "qrcode") {
      formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE];
    } else if (type === "barcode") {
      formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ];
    }

    const qrboxConfig = (viewfinderWidth, viewfinderHeight) => {
      const edgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      if (type === "qrcode") {
        const size = Math.floor(edgeSize * 0.65);
        return { width: size, height: size };
      }
      const width = Math.floor(viewfinderWidth * 0.8);
      const height = Math.floor(
        Math.min(viewfinderHeight * 0.3, edgeSize * 0.4),
      );
      return { width, height };
    };

    const config = {
      fps: 15,
      qrbox: qrboxConfig,
      disableFlip: false,
      ...(formatsToSupport.length > 0 && { formatsToSupport }),
    };

    const applyVideoPolish = (videoElement) => {
      if (!videoElement?.srcObject) return;
      trackRef.current = videoElement.srcObject.getTracks();
      const [track] = trackRef.current;

      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = "cover";
      videoElement.style.borderRadius = "0.5rem";

      const caps = track.getCapabilities?.();
      if (caps?.torch) setTorchSupported(true);
      if (caps?.focusMode?.includes?.("continuous")) {
        track
          .applyConstraints({ advanced: [{ focusMode: "continuous" }] })
          .catch(() => {});
      }
    };

    const start = async () => {
      if (isStartingRef.current) return;
      isStartingRef.current = true;

      if (!isMountedRef.current || !document.getElementById(regionId)) {
        isStartingRef.current = false;
        return;
      }

      const instance = new Html5Qrcode(regionId);
      const scanConfig = {
        ...config,
        videoConstraints: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      try {
        await instance.start(
          { facingMode: facingMode },
          scanConfig,
          handleDecoded,
          () => {},
        );

        if (!isMountedRef.current) {
          try {
            await instance.stop();
          } catch (e) {
            console.log(e);
          }
          instance.clear();
          isStartingRef.current = false;
          return;
        }

        scannerRef.current = instance;
        const video = document.getElementById(regionId)?.querySelector("video");
        applyVideoPolish(video);
        setStatus("running");
      } catch (err) {
        console.error(err);
        if (isMountedRef.current) {
          setStatus("error");
          setErrorMsg(
            "Could not access the camera. Try flipping or check permissions.",
          );
        }
      } finally {
        isStartingRef.current = false;
      }
    };

    start();

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [type, facingMode, handleDecoded, stopCamera, regionId]);

  const toggleTorch = async () => {
    if (!trackRef.current?.[0]) return;
    try {
      const track = trackRef.current[0];
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (e) {
      console.warn("Flashlight action failed:", e);
    }
  };

  const toggleCamera = async () => {
    setStatus("starting");
    await stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/20 backdrop-blur-md cursor-pointer"
    >
      <style>{`
        #${regionId} > div:not(video) { display: none !important; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full max-w-md p-5 border-emerald-300/60 cursor-default`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
          <label className={commonFieldColour.label}>
            {type === "barcode" ? "Barcode Reader" : "QR Scanner"}
          </label>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-800/60 hover:text-emerald-900 font-medium text-sm transition"
          >
            Cancel
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="relative w-full aspect-square bg-emerald-900/5 rounded-xl border border-emerald-200 overflow-hidden flex flex-col items-center justify-center">
          <div
            id={regionId}
            className="w-full h-full rounded-xl overflow-hidden"
          />

          {/* Loader Overlay */}
          {status === "starting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 z-20">
              <div
                className="w-7 h-7 border-2 border-emerald-200 rounded-full animate-spin"
                style={{ borderTopColor: PALETTE.mint }}
              />
              <span className="text-xs text-emerald-800 font-medium">
                Changing source...
              </span>
            </div>
          )}

          {/* Error Message */}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 bg-white/95 z-20">
              <span className="text-xs text-emerald-900 font-medium">
                {errorMsg}
              </span>
              <button
                type="button"
                onClick={toggleCamera}
                className="px-4 py-2 text-xs font-bold rounded-lg text-white"
                style={{ backgroundColor: PALETTE.mint }}
              >
                Switch Camera Source
              </button>
            </div>
          )}

          {/* Quick Controls Layout Layer over Video Stream */}
          {status === "running" && (
            <div className="absolute bottom-4 left-4 right-4 z-30 flex justify-between gap-2">
              {/* Camera Switch Control Toggle */}
              <button
                type="button"
                onClick={toggleCamera}
                className="px-3 py-2 bg-white hover:bg-emerald-50 rounded-lg shadow-md border text-xs font-bold transition flex items-center gap-1"
                style={{
                  borderColor: "rgba(47, 160, 132, 0.3)",
                  color: PALETTE.steelDark,
                }}
              >
                🔄 {facingMode === "environment" ? "Front Cam" : "Back Cam"}
              </button>

              {/* Torch Toggle */}
              {torchSupported && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className="px-3 py-2 rounded-lg shadow-md border transition text-xs font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: torchOn ? PALETTE.mint : "#FFFFFF",
                    borderColor: "rgba(47, 160, 132, 0.3)",
                    color: torchOn ? "#FFFFFF" : PALETTE.steelDark,
                  }}
                >
                  ⚡ {torchOn ? "Flash On" : "Flash Off"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Frame */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="text-center text-[11px] font-medium text-emerald-800/70 py-1 bg-emerald-50/50 rounded-lg border border-emerald-100">
            Currently using:{" "}
            {facingMode === "environment"
              ? "Rear Facing Camera"
              : "Front Selfie Camera"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={primaryButton}
            style={{ backgroundColor: PALETTE.mint, color: "#FFFFFF" }}
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;