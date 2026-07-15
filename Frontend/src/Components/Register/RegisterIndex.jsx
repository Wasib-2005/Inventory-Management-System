import { useState } from "react";
import SalesLedgerPanel from "./RegisterComponents/SalesLedgerPanel";
import FolderTabs from "./RegisterComponents/FolderTabs";
import FolderPanel from "./RegisterComponents/FolderPanel";
import { initialSales, initialCreditLedger } from "./RegisterComponents/constants";

const RegisterIndex = () => {
  const [activeFolder, setActiveFolder] = useState("operations");

  // TODO: no Sale/Transaction or Credit/Ledger schema exists yet, so both
  // stay static until those models exist - see constants.js for the shape
  // a future GET should match.
  const [sales] = useState(initialSales);
  const [creditLedger] = useState(initialCreditLedger);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-900">
          Warehouse Registry Desk
        </h1>
        <p className="text-emerald-700/50 text-sm mt-1">
          Monitor live transactions, track outstanding balances, and manage
          workflows through organized file decks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-7">
          <SalesLedgerPanel sales={sales} />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <FolderTabs activeFolder={activeFolder} onSelect={setActiveFolder} />
          <FolderPanel activeFolder={activeFolder} creditLedger={creditLedger} />
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;
