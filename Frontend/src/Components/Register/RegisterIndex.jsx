import {
  HiClipboardDocument,
  HiArrowDownLeft,
  HiArrowUpRight,
} from "react-icons/hi2";
import {
  IoCreateOutline as IoCreate,
  IoLocationOutline as IoLocation,
} from "react-icons/io5";
import { MdCategory, MdOutlinePrecisionManufacturing } from "react-icons/md";
import { GiCargoCrane } from "react-icons/gi";
import { AiOutlineBarcode } from "react-icons/ai";
import { PALETTE } from "../../Theme/palette";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { commonFieldColour } from "../../Theme/commonFieldColour";
import { secondaryButton } from "../../Theme/secondaryButton";
import { FiSliders, FiUsers } from "react-icons/fi";

const RegisterIndex = () => {
  const sampleSales = [
    {
      id: "1",
      username: "John Doe",
      mobile: "+1 555-0199",
      receipt: "REC-2026-0891",
      mrp: 1200,
      discount: 200,
      boughtPrice: 1000,
    },
    {
      id: "2",
      username: "Sarah Smith",
      mobile: "+1 555-0143",
      receipt: "REC-2026-0892",
      mrp: 450,
      discount: 0,
      boughtPrice: 450,
    },
    {
      id: "3",
      username: "Alex Rivera",
      mobile: "+1 555-0177",
      receipt: "REC-2026-0893",
      mrp: 3500,
      discount: 500,
      boughtPrice: 3000,
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-400 mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: PALETTE.steelDark }}>
          Warehouse Registry Desk
        </h1>
        <p className="text-emerald-800/60 text-sm">
          Monitor live transactions and manage system operations side-by-side.
        </p>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-start">
        {/* LIVE SALES LIST */}
        <div
          className={`w-full md:col-span-7 order-2 md:order-1 ${commonComponentBG()}`}
        >
          <div className="p-4 border-b border-emerald-300/30 flex justify-between items-center">
            <h2 className="font-bold text-emerald-900">
              Today's Sales Records
            </h2>
            <span
              className="px-2.5 py-1 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: PALETTE.mint }}
            >
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-emerald-900/60 uppercase text-xs font-semibold tracking-wider border-b border-emerald-300/20">
                <tr>
                  <th className="p-3">Customer / Mobile</th>
                  <th className="p-3">Receipt ID</th>
                  <th className="p-3 text-right">MRP</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right text-emerald-800">
                    Bought Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-300/10 text-emerald-900">
                {sampleSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-white/40 transition-all duration-150"
                  >
                    <td className="p-3">
                      <span className="block font-medium">{sale.username}</span>
                      <span className="text-xs text-emerald-800/50 block">
                        {sale.mobile}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-emerald-800/70">
                      {sale.receipt}
                    </td>
                    <td className="p-3 text-right text-emerald-800/60">
                      ${sale.mrp.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-medium">
                      {sale.discount > 0 ? `-$${sale.discount}` : "—"}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      ${sale.boughtPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full md:col-span-5 order-1 md:order-2 space-y-6">
          <div className={commonComponentBG()}>
            <div className="px-4 pt-4">
              <h2 className={`text-xs ${commonFieldColour.label}`}>
                Daily Operations
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 pt-0">
              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 bg-blue-500/10! hover:bg-blue-500/20! border-blue-400/30! text-center`}
              >
                <HiClipboardDocument className="text-2xl text-blue-700" />
                <span className="font-semibold tracking-wide text-blue-900">
                  Make an Order
                </span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 !bg-emerald-500/10 hover:!bg-emerald-500/20 !border-emerald-400/30 text-center`}
              >
                <HiArrowDownLeft className="text-2xl text-emerald-700" />
                <span className="font-semibold tracking-wide text-emerald-900">
                  Receive Inbound
                </span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 !bg-amber-500/10 hover:!bg-amber-500/20 !border-amber-400/30 text-center`}
              >
                <HiArrowUpRight className="text-2xl text-amber-700" />
                <span className="font-semibold tracking-wide text-amber-900">
                  Dispatch Outbound
                </span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 !bg-purple-500/10 hover:!bg-purple-500/20 !border-purple-400/30 text-center`}
              >
                <AiOutlineBarcode className="text-2xl text-purple-700" />
                <span className="font-semibold tracking-wide text-purple-900">
                  Cycle Count
                </span>
              </button>
            </div>
          </div>

          <div className={commonComponentBG()}>
            <div className="px-4 pt-4">
              <h2 className={`text-xs ${commonFieldColour.label}`}>
                Catalog & Infrastructure
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 pt-0">
              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 hover:!bg-white/60 text-center`}
              >
                <IoCreate className="text-2xl text-emerald-700" />
                <span className="font-semibold tracking-wide">New Product</span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 hover:!bg-white/60 text-center`}
              >
                <MdCategory className="text-2xl text-emerald-700" />
                <span className="font-semibold tracking-wide">
                  New Category
                </span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 hover:!bg-white/60 text-center`}
              >
                <IoLocation className="text-2xl text-emerald-700" />
                <span className="font-semibold tracking-wide">
                  New Location
                </span>
              </button>

              {/* Rose accent warning for stock changes */}
              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 !bg-rose-500/10 hover:!bg-rose-500/20 !border-rose-400/30 text-center`}
              >
                <FiSliders className="text-2xl text-rose-700" />
                <span className="font-semibold tracking-wide text-rose-900">
                  Adjust Stock
                </span>
              </button>
            </div>
          </div>

          <div className={commonComponentBG()}>
            <div className="px-4 pt-4">
              <h2 className={`text-xs ${commonFieldColour.label}`}>
                Partners & Supply
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 pt-0">
              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 hover:!bg-white/60 text-center`}
              >
                <GiCargoCrane className="text-2xl text-emerald-700" />
                <span className="font-semibold tracking-wide">Chain Node</span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 hover:!bg-white/60 text-center`}
              >
                <FiUsers className="text-2xl text-emerald-700" />
                <span className="font-semibold tracking-wide">
                  Register Supplier
                </span>
              </button>

              <button
                className={`${secondaryButton} py-5! px-2! text-xs! flex flex-col items-center justify-center gap-2 col-span-2 !bg-cyan-600/10 hover:!bg-cyan-600/20 !border-cyan-400/30 text-center`}
              >
                <MdOutlinePrecisionManufacturing className="text-2xl text-cyan-700" />
                <span className="font-semibold tracking-wide text-cyan-900">
                  Purchase Order
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;
