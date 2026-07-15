import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useGetName } from "../../Hooks/userGetAppName";


// Custom Design System Configurations
import { PALETTE } from "../../Theme/palette";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { commonFieldColour } from "../../Theme/commonFieldColour";
import { commonInputField } from "../../Theme/commonInputField";
import { HiArrowDownLeft, HiArrowUpRight, HiOutlineArrowTrendingUp, HiOutlineUserGroup } from "react-icons/hi2";
import { IoNotificationsOutline, IoSearchOutline, IoTimeOutline } from "react-icons/io5";
import { FiActivity } from "react-icons/fi";

const Home = () => {
  const pageName = `Registry Desk | ${useGetName || "IMS"}`;
  const [activeFolder, setActiveFolder] = useState("staff");

  // Colorful Telemetry Counters
  const telemetry = [
    { 
      label: "Active Staff on Duty", 
      value: "14 Operators", 
      status: "3 stations active", 
      icon: HiOutlineUserGroup, 
      color: "text-blue-600", 
      bg: "bg-blue-500/10",
      accent: "border-l-4 border-l-blue-500"
    },
    { 
      label: "Live Sales Today", 
      value: "$8,450", 
      status: "+18% vs yesterday", 
      icon: HiOutlineArrowTrendingUp, 
      color: "text-emerald-600", 
      bg: "bg-emerald-500/10",
      accent: "border-l-4 border-l-emerald-500"
    },
    { 
      label: "Inbound Pending Receive", 
      value: "9 Shipments", 
      status: "3 at staging docks", 
      icon: HiArrowDownLeft, 
      color: "text-amber-600", 
      bg: "bg-amber-500/10",
      accent: "border-l-4 border-l-amber-500"
    },
    { 
      label: "Outbound Cleared", 
      value: "42 Batches", 
      status: "100% dispatch rate", 
      icon: HiArrowUpRight, 
      color: "text-purple-600", 
      bg: "bg-purple-500/10",
      accent: "border-l-4 border-l-purple-500" 
    },
  ];

  // Live Sales / "What is Selling" Feed Data
  const liveSalesFeed = [
    { id: "TX-901", item: "Industrial Steel Cable", category: "Hardware", qty: 24, price: 1200, time: "4 mins ago" },
    { id: "TX-902", item: "Pneumatic Valve H-3", category: "Spares", qty: 2, price: 450, time: "12 mins ago" },
    { id: "TX-903", item: "Heavy Duty Cargo Straps", category: "Logistics", qty: 150, price: 3000, time: "18 mins ago" },
    { id: "TX-904", item: "Hydraulic Fluid (Gallon)", category: "Fluids", qty: 8, price: 640, time: "30 mins ago" },
  ];

  // Active Staff Data
  const activeStaff = [
    { name: "John Doe", role: "Staging Lead", zone: "Dock A", status: "Receiving Inbound" },
    { name: "Sarah Smith", role: "Quality Inspector", zone: "Bin Section 4", status: "Cycle Counting" },
    { name: "Alex Rivera", role: "Dispatcher", zone: "Dock C", status: "Clearing Outbound" },
    { name: "Emily Chen", role: "Inventory Analyst", zone: "HQ Console", status: "Updating Registry" },
  ];

  // Live Freight / Product Movements (Incoming & Outgoing)
  const freightMovements = [
    { type: "INBOUND", id: "FR-9810", description: "Batch 44 - Copper Pipes", sourceDest: "Global Metal Corp", status: "At Dock 1", time: "10:45 AM" },
    { type: "OUTGOING", id: "FR-2201", description: "Order 802 - Electronic Kits", sourceDest: "Tech Hub Retail", status: "Staging Area", time: "11:15 AM" },
    { type: "INBOUND", id: "FR-9811", description: "Batch 45 - Rubber Seals", sourceDest: "FlexiParts Ltd", status: "In Transit", time: "12:30 PM" },
    { type: "OUTGOING", id: "FR-2202", description: "Order 805 - Safety Helmets", sourceDest: "Apex Construction", status: "Dispatched", time: "01:00 PM" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8" style={{ backgroundColor: PALETTE.bg }}>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-emerald-300/30">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Live Telemetry Feed</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-0.5" style={{ color: PALETTE.steelDark }}>
            Warehouse Registry Desk
          </h1>
        </div>

        {/* Search & Global Status */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <IoSearchOutline className={commonFieldColour.icon + " top-1/2 -translate-y-1/2 text-emerald-600"} />
            <input
              type="text"
              placeholder="Search live records..."
              className={`${commonInputField} pl-9`}
            />
          </div>
          <button className="p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/30 rounded-lg relative transition-all">
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            <IoNotificationsOutline className="text-xl" />
          </button>
        </div>
      </header>

      {/* METRICS PANEL (Live High-Level Counters) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {telemetry.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className={`${commonComponentBG()} ${m.accent} overflow-hidden`}>
              <div className="p-5 flex items-start justify-between">
                <div className="space-y-1.5">
                  <span className={`text-[10px] block ${commonFieldColour.label}`}>{m.label}</span>
                  <span className="text-2xl font-black block" style={{ color: PALETTE.steelDark }}>{m.value}</span>
                  <span className="text-[11px] font-semibold text-emerald-800/70 flex items-center gap-1 bg-emerald-50/60 px-2 py-0.5 rounded-full w-max">
                    <FiActivity className="text-emerald-600 animate-pulse" /> {m.status}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${m.bg}`}>
                  <Icon className={`text-xl ${m.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* CORE DATA DISPLAY */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: WHAT IS SELLING (Real-time Ledger Feed) */}
        <div className={`lg:col-span-7 ${commonComponentBG()}`}>
          <div className="p-5 border-b border-emerald-300/20 flex justify-between items-center bg-gradient-to-r from-white to-emerald-50/20">
            <div>
              <h2 className="font-bold text-emerald-950 text-lg">Sales & Registry Ledger</h2>
              <p className="text-xs text-emerald-800/50 mt-0.5">Real-time inventory depletion logs and checkouts</p>
            </div>
            <span
              className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full text-white bg-emerald-600 shadow-sm animate-pulse"
            >
              • Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-emerald-50/55 text-emerald-900/70 uppercase text-[10px] font-extrabold tracking-widest border-b border-emerald-300/20">
                <tr>
                  <th className="p-4 pl-6">Ref ID</th>
                  <th className="p-4">Item & Class</th>
                  <th className="p-4 text-center">Qty Removed</th>
                  <th className="p-4 text-right">Value</th>
                  <th className="p-4 pr-6 text-right">Time Offset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-300/10 text-emerald-900">
                {liveSalesFeed.map((sale) => (
                  <tr key={sale.id} className="hover:bg-emerald-50/30 transition-all duration-150">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-emerald-800">
                      {sale.id}
                    </td>
                    <td className="p-4">
                      <span className="block font-bold text-emerald-950">{sale.item}</span>
                      <span className="text-[10px] font-bold text-emerald-700/50 uppercase">{sale.category}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700">{sale.qty}</td>
                    <td className="p-4 text-right font-black text-emerald-700">${sale.price.toLocaleString()}</td>
                    <td className="p-4 pr-6 text-right text-xs text-emerald-800/60 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <IoTimeOutline className="text-xs" /> {sale.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COMPONENT: FOLDER MONITORING PANEL */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Physical Folders style layout */}
          <div className="flex items-end pl-3 -space-x-1 z-10">
            {/* Folder 1: Live Duty Staff */}
            <button
              onClick={() => setActiveFolder("staff")}
              className={`relative px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 ${
                activeFolder === "staff"
                  ? "bg-white text-blue-700 border-emerald-300/50 h-10 shadow-[0_-4px_10px_-4px_rgba(47,160,132,0.1)] border-b-2 border-b-blue-500"
                  : "bg-blue-900/10 text-blue-800/50 border-transparent hover:bg-blue-900/20 h-9 hover:text-blue-800"
              }`}
            >
              Who's Working
            </button>

            {/* Folder 2: Freight Status */}
            <button
              onClick={() => setActiveFolder("freight")}
              className={`relative px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 ${
                activeFolder === "freight"
                  ? "bg-white text-purple-700 border-emerald-300/50 h-10 shadow-[0_-4px_10px_-4px_rgba(47,160,132,0.1)] border-b-2 border-b-purple-500"
                  : "bg-purple-900/10 text-purple-800/50 border-transparent hover:bg-purple-900/20 h-9 hover:text-purple-800"
              }`}
            >
              Cargo Movements
            </button>
          </div>

          {/* Folder Content (Rendered as physical document sheet) */}
          <div className={`${commonComponentBG()} rounded-tl-none -mt-[1px] relative z-0 p-6`}>
            
            {/* Sheet 1: Who is Working */}
            {activeFolder === "staff" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Active Shift Registry</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Personnel checked in on the warehouse floor</p>
                </div>
                <div className="divide-y divide-emerald-300/10">
                  {activeStaff.map((staff, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950">{staff.name}</h4>
                        <p className="text-xs text-emerald-800/60 font-semibold">{staff.role} • <span className="text-blue-600">{staff.zone}</span></p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded bg-emerald-50 text-emerald-800 border border-emerald-300/20">
                        {staff.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sheet 2: Freight Status (Incoming / Outgoing Movements) */}
            {activeFolder === "freight" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Real-Time Cargo Status</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Physical item inflows and outflows</p>
                </div>
                <div className="space-y-3">
                  {freightMovements.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/50 border border-emerald-300/10 rounded-lg flex justify-between items-center gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            item.type === "INBOUND" 
                              ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/20" 
                              : "bg-purple-500/15 text-purple-800 border border-purple-500/20"
                          }`}>
                            {item.type}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700">{item.id}</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-950">{item.description}</p>
                        <p className="text-[10px] font-semibold text-emerald-800/50">Partner: {item.sourceDest}</p>
                      </div>
                      
                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className="text-xs font-black text-slate-800">{item.status}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;