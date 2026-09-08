import { createPortal } from "react-dom";
import { FiX, FiPrinter } from "react-icons/fi";
import CashMemo from "./Cashmemo";

// Shown after an order is created, confirmed, or paid. Print isolates
// #cash-memo-print (the CashMemo's own root) via @media print — hides
// everything else on the page, including this modal's own chrome, so
// only the receipt comes out of the printer.
const CashMemoModal = ({ order, onClose }) => {
  const handlePrint = () => window.print();

  return createPortal(
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cash-memo-print, #cash-memo-print * { visibility: visible; }
          #cash-memo-print {
            position: fixed;
            inset: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
          }
        }
      `}</style>

      <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
            <h3 className="font-bold text-emerald-900 text-[16px]">
              Order Receipt
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-sm">
              <CashMemo order={order} />
            </div>
          </div>

          <div className="p-4 border-t border-emerald-300/30 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-[16px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-[16px] text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors"
            >
              <FiPrinter size={16} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default CashMemoModal;
