import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import FolderTabs, { FOLDERS } from "./RegisterComponents/FolderTabs";
import SubTabs, { SUB_FOLDERS } from "./RegisterComponents/SubTabs";
import FolderPanel from "./RegisterComponents/FolderPanel";
import HeaderActions from "./RegisterComponents/HeaderActions";

const VALID_FOLDER_IDS = FOLDERS.map((f) => f.id);
const DEFAULT_FOLDER = "products-sell";

const RegisterIndex = () => {
  const { selection, "*": rest } = useParams();
  const navigate = useNavigate();

  const activeFolder = VALID_FOLDER_IDS.includes(selection)
    ? selection
    : DEFAULT_FOLDER;

  useEffect(() => {
    if (selection !== activeFolder) {
      navigate(`/register/${activeFolder}`, { replace: true });
    }
  }, [selection, activeFolder, navigate]);

  const [subSegment, typeSegment] = (rest || "").split("/").filter(Boolean);
  const subs = SUB_FOLDERS[activeFolder] || [];
  const activeSub = subs.some((s) => s.id === subSegment)
    ? subSegment
    : subs[0]?.id;

  useEffect(() => {
    if (activeSub && subSegment !== activeSub) {
      navigate(`/register/${activeFolder}/${activeSub}`, { replace: true });
    }
  }, [activeFolder, activeSub, subSegment, navigate]);

  const [sales] = useState();

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-emerald-900">
            Inventory Registry
          </h1>
          <p className="text-emerald-700/50  mt-1">
            Sell, track credit, and manage your catalog and stock — all from one
            place.
          </p>
        </div>
        <HeaderActions />
      </div>

      <FolderTabs
        activeFolder={activeFolder}
        onSelect={(id) => navigate(`/register/${id}`)}
      />

      <div className="bg-white/70 backdrop-blur border border-emerald-300/50 rounded-3xl rounded-tl-none shadow-[0_2px_16px_rgba(47,160,132,0.1)] p-5 sm:p-8 -mt-px relative z-0">
        <SubTabs
          folder={activeFolder}
          activeSub={activeSub}
          onSelect={(sub) => navigate(`/register/${activeFolder}/${sub}`)}
        />
        <div className="mt-5 max-h-[78vh] overflow-y-auto pr-1">
          <FolderPanel
            activeFolder={activeFolder}
            activeSub={activeSub}
            typeSegment={typeSegment}
            onTypeChange={(type) =>
              navigate(`/register/${activeFolder}/${activeSub}/${type}`)
            }
            sales={sales}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;