import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import FolderTabs, { FOLDERS } from "./RegisterComponents/FolderTabs";
import SubTabs, { SUB_FOLDERS } from "./RegisterComponents/SubTabs";
import FolderPanel from "./RegisterComponents/FolderPanel";
import HeaderActions from "./RegisterComponents/HeaderActions";
import { initialSales, initialCreditLedger } from "./RegisterComponents/constants";

const VALID_FOLDER_IDS = FOLDERS.map((f) => f.id);
const DEFAULT_FOLDER = "products-sell";

const RegisterIndex = () => {
  const { selection } = useParams();
  const navigate = useNavigate();

  const activeFolder = VALID_FOLDER_IDS.includes(selection)
    ? selection
    : DEFAULT_FOLDER;

  useEffect(() => {
    if (selection !== activeFolder) {
      navigate(`/register/${activeFolder}`, { replace: true });
    }
  }, [selection, activeFolder, navigate]);

  const [activeSub, setActiveSub] = useState(SUB_FOLDERS[activeFolder][0].id);
  useEffect(() => {
    setActiveSub(SUB_FOLDERS[activeFolder][0].id);
  }, [activeFolder]);

  const [sales] = useState(initialSales);
  const [creditLedger] = useState(initialCreditLedger);

  return (
    <div className="p-3 md:p-5 max-w-3xl mx-auto min-h-screen">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-emerald-900">
            Inventory Registry
          </h1>
          <p className="text-emerald-700/50 text-xs mt-0.5">
            Sell, track credit, and manage your catalog and stock - all from
            one place.
          </p>
        </div>
        <HeaderActions />
      </div>

      <FolderTabs activeFolder={activeFolder} onSelect={(id) => navigate(`/register/${id}`)} />

      <div className="bg-white/70 backdrop-blur border border-emerald-300/50 rounded-2xl rounded-tl-none shadow-[0_2px_12px_rgba(47,160,132,0.1)] p-4 sm:p-5 -mt-px relative z-0">
        <SubTabs folder={activeFolder} activeSub={activeSub} onSelect={setActiveSub} />
        <div className="mt-4 max-h-[65vh] overflow-y-auto pr-0.5">
          <FolderPanel
            activeFolder={activeFolder}
            activeSub={activeSub}
            sales={sales}
            creditLedger={creditLedger}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;