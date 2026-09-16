import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import FolderTabs, { FOLDERS } from "./RegisterComponents/FolderTabs";
import SubTabs, { SUB_FOLDERS } from "./RegisterComponents/SubTabs";
import FolderPanel from "./RegisterComponents/FolderPanel";
import HeaderActions from "./RegisterComponents/HeaderActions";
import { FiActivity } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto min-h-full">
      <div className="mb-4 rounded-xl border border-emerald-300/50 bg-white/70 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FiActivity size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold uppercase tracking-wider text-emerald-700/60">
                Operations workspace
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-900">
                Inventory Register
              </h1>
              <p className="text-base text-emerald-700/70 mt-1 max-w-2xl">
                Sell products, review payments, manage catalog data, and control inventory tasks from one place.
              </p>
            </div>
          </div>
          <HeaderActions />
        </div>
      </div>

      <FolderTabs
        activeFolder={activeFolder}
        onSelect={(id) => navigate(`/register/${id}`)}
      />

      <div className="bg-white/70 backdrop-blur border border-emerald-300/50 rounded-2xl sm:rounded-3xl shadow-[0_2px_16px_rgba(47,160,132,0.1)] p-2 sm:p-4 lg:p-6 relative z-0">
        <SubTabs
          folder={activeFolder}
          activeSub={activeSub}
          onSelect={(sub) => navigate(`/register/${activeFolder}/${sub}`)}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeFolder}-${activeSub}-${typeSegment || ""}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-3 sm:mt-4 min-w-0"
          >
            <FolderPanel
              activeFolder={activeFolder}
              activeSub={activeSub}
              typeSegment={typeSegment}
              onTypeChange={(type) =>
                navigate(`/register/${activeFolder}/${activeSub}/${type}`)
              }
              sales={sales}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegisterIndex;