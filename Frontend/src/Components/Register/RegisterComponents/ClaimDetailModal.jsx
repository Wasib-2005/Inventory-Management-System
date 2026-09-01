import { createPortal } from "react-dom";
import {
  FiX,
  FiCornerUpLeft,
  FiShield,
  FiTool,
  FiUser,
  FiUserCheck,
  FiEdit3,
  FiPackage,
  FiCheck,
  FiCheckCircle,
  FiRotateCcw,
} from "react-icons/fi";
import { makeImageUrl } from "../../../Service/auth/makeImageUrl";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const TYPE_META = {
  return: {
    label: "Return",
    icon: FiCornerUpLeft,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
  },
  warranty: {
    label: "Warranty Claim",
    icon: FiShield,
    accent: "text-purple-600 bg-purple-50 border-purple-200",
  },
  guarantee: {
    label: "Guarantee Claim",
    icon: FiTool,
    accent: "text-blue-600 bg-blue-50 border-blue-200",
  },
};

const STATUS_STYLES = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  approved: "text-blue-600 bg-blue-50 border-blue-200",
  processing: "text-indigo-600 bg-indigo-50 border-indigo-200",
  rejected: "text-rose-600 bg-rose-50 border-rose-200",
  completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const PersonRow = ({ icon: Icon, label, person }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={16} className="text-emerald-600" />
    </div>
    <div className="min-w-0">
      <p className="text-base font-bold text-emerald-700/60 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-base font-semibold text-emerald-900 truncate">
        {person?.username || "—"}
      </p>
      {person?.email && (
        <p className="text-base text-emerald-700/60 truncate">{person.email}</p>
      )}
    </div>
  </div>
);

const ClaimDetailModal = ({
  isOpen,
  onClose,
  claim,
  onStatusChange,
  onClaimedChange,
  actionBusy,
}) => {
  if (!isOpen || !claim) return null;

  const meta = TYPE_META[claim.type] || TYPE_META.return;
  const Icon = meta.icon;
  const product = claim.product;
  const order = claim.order;

  const btn = (label, icon, status, cls) => (
    <button
      key={status}
      type="button"
      disabled={actionBusy}
      onClick={() => onStatusChange?.(claim, status)}
      className={`flex items-center gap-2 text-base font-bold px-4 py-2.5 rounded-lg border transition-colors disabled:opacity-40 ${cls}`}
    >
      {icon} {label}
    </button>
  );

  const renderActions = () => {
    if (claim.claimed) return null;

    if (claim.status === "pending") {
      return (
        <>
          {btn(
            "Approve",
            <FiCheck size={18} />,
            "approved",
            "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
          )}
          {btn(
            "Reject",
            <FiX size={18} />,
            "rejected",
            "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100",
          )}
        </>
      );
    }
    if (claim.status === "approved") {
      return btn(
        "Start Processing",
        <FiRotateCcw size={18} />,
        "processing",
        "text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      );
    }
    if (claim.status === "processing") {
      return btn(
        "Complete",
        <FiCheckCircle size={18} />,
        "completed",
        "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      );
    }
    return null;
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-emerald-300/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-md border flex items-center justify-center shrink-0 ${meta.accent}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-lg">
                {meta.label}
              </h3>
              <p className="text-base text-emerald-700/60">
                Logged {formatDateTime(claim.createdAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-emerald-700/50 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Status */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-emerald-300/30 bg-emerald-50/40">
            <span className="text-base font-bold text-emerald-700/60 uppercase">
              Status
            </span>
            <select
              value={claim.status || "pending"}
              disabled={actionBusy || claim.claimed}
              onChange={(e) => onStatusChange?.(claim, e.target.value)}
              className={`text-base font-bold uppercase px-3 py-1.5 rounded-full border focus:outline-none disabled:opacity-50 ${
                STATUS_STYLES[claim.status] || STATUS_STYLES.pending
              }`}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Status change actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {renderActions()}
          </div>

          {/* Claimed toggle — only unlocked once status is completed */}
          {(claim.status === "completed" || claim.status === "rejected") && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-emerald-300/30 bg-white">
              <div>
                <span className="text-base font-bold text-emerald-700/60 uppercase block">
                  Claimed
                </span>
                {claim.claimed && (
                  <span className="text-base text-emerald-700/40">
                    Item handed over — status locked
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onClaimedChange?.(claim, !claim.claimed)}
                className={`text-base font-bold uppercase px-4 py-2 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  claim.claimed
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    : "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {claim.claimed ? "Unclaim" : "Mark as Claimed"}
              </button>
            </div>
          )}
          
          {/* Product */}
          <div className="flex items-center gap-4 p-3.5 rounded-lg border border-emerald-300/30 bg-white">
            <img
              src={makeImageUrl(product?.image?.header)}
              alt={product?.name}
              className="w-14 h-14 rounded-md object-cover border border-emerald-300/40 bg-white shrink-0"
              onError={(e) => (e.target.style.visibility = "hidden")}
            />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-emerald-900 truncate">
                {product?.name}
              </p>
              <p className="text-base text-emerald-700/60">
                {product?.displayId} · Qty {claim.qty}
              </p>
            </div>
          </div>

          {/* Claim details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base font-bold text-emerald-700/60 uppercase">
                Resolution
              </p>
              <p className="text-base font-semibold text-emerald-900">
                {claim.resolution || "—"}
              </p>
            </div>
            {claim.reason && (
              <div>
                <p className="text-base font-bold text-emerald-700/60 uppercase">
                  Reason
                </p>
                <p className="text-base font-semibold text-emerald-900">
                  {claim.reason}
                </p>
              </div>
            )}
            {claim.refundAmount > 0 && (
              <div>
                <p className="text-base font-bold text-emerald-700/60 uppercase">
                  Refund Amount
                </p>
                <p className="text-base font-bold text-rose-600">
                  {currency}
                  {Number(claim.refundAmount).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-base font-bold text-emerald-700/60 uppercase">
                Order
              </p>
              <p className="text-base font-semibold text-emerald-900 font-mono">
                #
                {String(order?._id || "")
                  .slice(-6)
                  .toUpperCase()}
              </p>
            </div>
          </div>

          {claim.notes && (
            <div>
              <p className="text-base font-bold text-emerald-700/60 uppercase mb-1.5">
                Note
              </p>
              <p className="text-base text-emerald-800 bg-emerald-50/40 border border-emerald-300/30 rounded-lg p-3.5">
                {claim.notes}
              </p>
            </div>
          )}

          {/* People */}
          <div className="flex flex-col gap-4 border-t border-emerald-300/30 pt-4">
            <PersonRow
              icon={FiUser}
              label="Bought By"
              person={order?.customerId}
            />
            <PersonRow
              icon={FiPackage}
              label="Order Logged By"
              person={order?.createdBy}
            />
            <PersonRow
              icon={FiUserCheck}
              label="Claim Logged By"
              person={claim.createdBy}
            />
            <PersonRow
              icon={FiEdit3}
              label="Last Updated By"
              person={claim.updatedBy}
            />
          </div>

          <p className="text-base text-emerald-700/50 text-right">
            Last updated {formatDateTime(claim.updatedAt)}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ClaimDetailModal;
