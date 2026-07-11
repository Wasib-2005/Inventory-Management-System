import { FiPlus, FiTrash2 } from "react-icons/fi";
import { CiBarcode } from "react-icons/ci";
import CameraScanner from "../../../../../utility/CameraScanner";
import { BARCODE_TYPES } from "./constants";
import { commonInputField } from "../../../../../Theme/commonInputField";

const BarcodesSection = ({
  barcodes,
  scanningIndex,
  onAdd,
  onUpdate,
  onRemove,
  onScanStart,
  onScanCancel,
  onScanDetected,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-white border border-emerald-200 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-emerald-800 font-semibold uppercase text-xs tracking-wider">
          Barcodes
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
        >
          <FiPlus size={12} /> Add Barcode
        </button>
      </div>

      {barcodes.length === 0 && (
        <p className="text-[11px] text-emerald-700/50 italic">
          No barcodes yet — click "Add Barcode" to create one.
        </p>
      )}

      {barcodes.map((bc, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Code"
              value={bc.code}
              onChange={(e) => onUpdate(index, "code", e.target.value)}
              className={`${commonInputField} flex-1`}
            />
            <button
              type="button"
              onClick={() =>
                scanningIndex === index ? onScanCancel() : onScanStart(index)
              }
              className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                scanningIndex === index
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white/50 border-emerald-300/60 hover:bg-emerald-50 text-emerald-700"
              }`}
              title="Scan barcode"
            >
              <CiBarcode size={20} />
            </button>
            <select
              value={bc.type}
              onChange={(e) => onUpdate(index, "type", e.target.value)}
              className="cursor-pointer"
            >
              {BARCODE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-400 hover:text-red-600 p-1 shrink-0"
            >
              <FiTrash2 size={14} />
            </button>
          </div>

          {scanningIndex === index && (
            <CameraScanner
              type="barcode"
              onScanSuccess={(decodedText) =>
                onScanDetected(index, decodedText)
              }
              onClose={onScanCancel}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default BarcodesSection;
