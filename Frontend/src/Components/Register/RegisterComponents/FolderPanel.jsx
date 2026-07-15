import OperationsFolder from "./OperationsFolder";
import CreditFolder from "./CreditFolder";
import CatalogFolder from "./CatalogFolder";
import SupplyFolder from "./SupplyFolder";

const FolderPanel = ({ activeFolder, creditLedger }) => (
  <div className="bg-white/70 backdrop-blur border border-emerald-300/50 rounded-2xl rounded-tl-none shadow-[0_2px_12px_rgba(47,160,132,0.1)] p-5 sm:p-6 -mt-px relative z-0">
    {activeFolder === "operations" && <OperationsFolder />}
    {activeFolder === "credit" && <CreditFolder ledger={creditLedger} />}
    {activeFolder === "catalog" && <CatalogFolder />}
    {activeFolder === "supply" && <SupplyFolder />}
  </div>
);

export default FolderPanel;
