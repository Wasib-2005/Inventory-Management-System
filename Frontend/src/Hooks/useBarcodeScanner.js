import { useEffect, useRef } from "react";

// Hardware barcode scanners act like a very fast keyboard: they "type" each
// character of the barcode in rapid succession, then send an Enter. Human
// typing has more irregular timing (usually well over 50ms between keys),
// so we use that timing gap to tell a scan apart from someone typing
// normally into a text field.
const MAX_KEY_INTERVAL_MS = 50;
const MIN_BARCODE_LENGTH = 4;
const BUFFER_RESET_MS = 300;

/**
 * Listens globally for barcode-scanner keystrokes and calls onScan(code)
 * whenever a fast burst of keys ending in Enter is detected.
 *
 * @param {(code: string) => void} onScan
 * @param {boolean} enabled - only listens while true (e.g. modal open)
 */
const useBarcodeScanner = (onScan, enabled = true) => {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const resetTimeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const resetBuffer = () => {
      bufferRef.current = "";
    };

    const handleKeyDown = (e) => {
      if (e.key !== "Enter" && e.key.length !== 1) return;

      const now = Date.now();
      const elapsed = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const code = bufferRef.current;
        resetBuffer();
        if (code.length >= MIN_BARCODE_LENGTH) {
          onScan(code);
        }
        return;
      }

      if (elapsed > MAX_KEY_INTERVAL_MS) {
        bufferRef.current = "";
      }

      bufferRef.current += e.key;

      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(resetBuffer, BUFFER_RESET_MS);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(resetTimeoutRef.current);
      resetBuffer();
    };
  }, [enabled, onScan]);
};

export default useBarcodeScanner;