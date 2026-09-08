// Barcode.jsx
import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const Barcode = ({ value, height = 60, width = 2.2, fontSize = 12 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    try {
      JsBarcode(canvasRef.current, value, {
        format: "CODE128",
        height,
        width,
        fontSize,
        margin: 10,
        displayValue: false,
      });
    } catch {
      // Leave the canvas empty if the value can't be encoded.
    }
  }, [value, height, width, fontSize]);

  if (!value) return null;
  return <canvas ref={canvasRef} />;
};

export default Barcode;