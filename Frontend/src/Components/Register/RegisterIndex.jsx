import React, { useState } from "react";
import {
  HiClipboardDocument,
  HiArrowDownLeft,
  HiArrowUpRight,
} from "react-icons/hi2";
import {
  IoCreateOutline as IoCreate,
  IoLocationOutline as IoLocation,
  IoCardOutline,
} from "react-icons/io5";
import { MdCategory, MdOutlinePrecisionManufacturing, MdOutlineAttachMoney } from "react-icons/md";
import { GiCargoCrane } from "react-icons/gi";
import { AiOutlineBarcode } from "react-icons/ai";
import { FiSliders, FiUsers } from "react-icons/fi";

// Mocking imports for preview/compilation safety. 
// Replace these fallback values with your actual imports.
const PALETTE = {
  steelDark: "#1e293b",
  mint: "#10b981",
};
const commonComponentBG = () => "bg-white border border-slate-200 rounded-xl shadow-sm";
const commonFieldColour = { label: "text-slate-500 font-semibold" };
const secondaryButton = "w-full border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors";

const RegisterIndex = () => {
  const [activeFolder, setActiveFolder] = useState("operations");

  // Enriched Sales Ledger with Payment Modes & Statuses
  const sampleSales = [
    {
      id: "1",
      username: "John Doe",
      mobile: "+1 555-0199",
      receipt: "REC-2026-0891",
      mrp: 1200,
      discount: 200,
      boughtPrice: 1000,
      status: "Paid",
      type: "Cash"
    },
    {
      id: "2",
      username: "Sarah Smith",
      mobile: "+1 555-0143",
      receipt: "REC-2026-0892",
      mrp: 450,
      discount: 0,
      boughtPrice: 450,
      status: "Credit",
      type: "Net-30"
    },
    {
      id: "3",
      username: "Alex Rivera",
      mobile: "+1 555-0177",
      receipt: "REC-2026-0893",
      mrp: 3500,
      discount: 500,
      boughtPrice: 3000,
      status: "Partial",
      type: "Split-Credit"
    },
  ];

  // Credit Accounts Data
  const creditLedger = [
    { customer: "Sarah Smith", outstanding: 450, limit: 5000, dueDate: "Aug 12, 2026" },
    { customer: "Alex Rivera", outstanding: 1200, limit: 3000, dueDate: "Jul 28, 2026" },
    { customer: "Apex Builders", outstanding: 8400, limit: 10000, dueDate: "Overdue" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: PALETTE.steelDark }}>
          Warehouse Registry Desk
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor live transactions, track outstanding balances, and manage systemic workflows through organized file decks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: LIVE SALES LIST WITH PAYMENT STATUS */}
        <div className={`lg:col-span-7 ${commonComponentBG()} overflow-hidden`}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Today's Sales & Credit Records</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time settlement and clearance tracker</p>
            </div>
            <span
              className="px-3 py-1 text-xs font-bold rounded-full text-white animate-pulse"
              style={{ backgroundColor: PALETTE.mint }}
            >
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Customer Details</th>
                  <th className="p-4">Receipt & Mode</th>
                  <th className="p-4 text-right">Discount</th>
                  <th className="p-4 text-right">Net Price</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sampleSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="block font-semibold text-slate-800">{sale.username}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">{sale.mobile}</span>
                    </td>
                    <td className="p-4">
                      <span className="block font-mono text-xs text-slate-500">{sale.receipt}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">{sale.type}</span>
                    </td>
                    <td className="p-4 text-right text-rose-500 font-medium">
                      {sale.discount > 0 ? `-$${sale.discount}` : "—"}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-800">
                      ${sale.boughtPrice.toLocaleString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        sale.status === "Paid" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sale.status === "Credit"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE FOLDER SYSTEM */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Physical Folder Style Tabs */}
          <div className="flex items-end pl-2 -space-x-1 z-10 overflow-x-auto whitespace-nowrap scrollbar-none">
            {/* Tab 1: Operations */}
            <button
              onClick={() => setActiveFolder("operations")}
              className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 ${
                activeFolder === "operations"
                  ? "bg-white text-blue-600 border-slate-200 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] h-11"
                  : "bg-slate-200/70 text-slate-500 border-transparent hover:bg-slate-200 h-10 hover:text-slate-700"
              }`}
            >
              Operations
            </button>

            {/* Tab 2: Credit Pay (New Tab) */}
            <button
              onClick={() => setActiveFolder("credit")}
              className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 ${
                activeFolder === "credit"
                  ? "bg-white text-rose-600 border-slate-200 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] h-11"
                  : "bg-slate-200/70 text-slate-500 border-transparent hover:bg-slate-200 h-10 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Credit Pay
              </div>
            </button>

            {/* Tab 3: Catalog */}
            <button
              onClick={() => setActiveFolder("catalog")}
              className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 ${
                activeFolder === "catalog"
                  ? "bg-white text-emerald-600 border-slate-200 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] h-11"
                  : "bg-slate-200/70 text-slate-500 border-transparent hover:bg-slate-200 h-10 hover:text-slate-700"
              }`}
            >
              Catalog
            </button>

            {/* Tab 4: Supply */}
            <button
              onClick={() => setActiveFolder("supply")}
              className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 ${
                activeFolder === "supply"
                  ? "bg-white text-purple-600 border-slate-200 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] h-11"
                  : "bg-slate-200/70 text-slate-500 border-transparent hover:bg-slate-200 h-10 hover:text-slate-700"
              }`}
            >
              Supply
            </button>
          </div>

          {/* Folder Body */}
          <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none shadow-sm p-6 -mt-[1px] relative z-0">
            
            {/* Folder: Operations Content */}
            {activeFolder === "operations" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Daily Activity Workflows</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage live cargo & inventory movements</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-blue-50/40 hover:bg-blue-50 border-blue-100 hover:border-blue-200 group`}>
                    <HiClipboardDocument className="text-2xl text-blue-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-blue-900 text-xs">Make an Order</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-emerald-50/40 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-200 group`}>
                    <HiArrowDownLeft className="text-2xl text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-emerald-900 text-xs">Receive Inbound</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-amber-50/40 hover:bg-amber-50 border-amber-100 hover:border-amber-200 group`}>
                    <HiArrowUpRight className="text-2xl text-amber-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-amber-900 text-xs">Dispatch Outbound</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-purple-50/40 hover:bg-purple-50 border-purple-100 hover:border-purple-200 group`}>
                    <AiOutlineBarcode className="text-2xl text-purple-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-purple-900 text-xs">Cycle Count</span>
                  </button>
                </div>
              </div>
            )}

            {/* Folder: Credit Pay Content */}
            {activeFolder === "credit" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Credit & Debt Ledger</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Settle client invoices and track outstanding debt limits</p>
                </div>
                
                {/* Outstanding accounts quick ledger list */}
                <div className="space-y-3 mb-5">
                  {creditLedger.map((account, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-slate-800">{account.customer}</h4>
                        <span className="text-[10px] text-slate-400">Limit: ${account.limit.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-rose-600">${account.outstanding.toLocaleString()}</span>
                        <span className={`text-[10px] font-semibold ${account.dueDate === "Overdue" ? "text-rose-500 font-bold" : "text-slate-400"}`}>
                          {account.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credit Desk Operations */}
                <div className="grid grid-cols-2 gap-3">
                  <button className={`${secondaryButton} py-3 flex items-center justify-center gap-2 bg-rose-50/40 hover:bg-rose-50 border-rose-100 text-rose-700`}>
                    <MdOutlineAttachMoney className="text-lg" />
                    <span className="text-xs font-bold">Collect Pay</span>
                  </button>
                  <button className={`${secondaryButton} py-3 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-100`}>
                    <IoCardOutline className="text-lg text-slate-600" />
                    <span className="text-xs font-bold">Adjust Limit</span>
                  </button>
                </div>
              </div>
            )}

            {/* Folder: Catalog Content */}
            {activeFolder === "catalog" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Catalog & Physical Infrastructure</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Register nodes, locations, and parameters</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-100 group`}>
                    <IoCreate className="text-2xl text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-slate-700 text-xs">New Product</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-100 group`}>
                    <MdCategory className="text-2xl text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-slate-700 text-xs">New Category</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-100 group`}>
                    <IoLocation className="text-2xl text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-slate-700 text-xs">New Location</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-rose-5/40 hover:bg-rose-50 border-rose-100 hover:border-rose-200 group`}>
                    <FiSliders className="text-2xl text-rose-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-rose-900 text-xs">Adjust Stock</span>
                  </button>
                </div>
              </div>
            )}

            {/* Folder: Supply Content */}
            {activeFolder === "supply" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Partners & Supply Chain Nodes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Coordinate supply streams and vendors</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-100 group`}>
                    <GiCargoCrane className="text-2xl text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-slate-700 text-xs">Chain Node</span>
                  </button>

                  <button className={`${secondaryButton} py-6 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-100 group`}>
                    <FiUsers className="text-2xl text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-slate-700 text-xs">Register Supplier</span>
                  </button>

                  <button className={`${secondaryButton} py-6 col-span-2 flex flex-col items-center gap-2 bg-cyan-5/40 hover:bg-cyan-50 border-cyan-100 hover:border-cyan-200 group`}>
                    <MdOutlinePrecisionManufacturing className="text-2xl text-cyan-600 group-hover:scale-105 transition-transform" />
                    <span className="font-semibold text-cyan-900 text-xs">Purchase Order</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;