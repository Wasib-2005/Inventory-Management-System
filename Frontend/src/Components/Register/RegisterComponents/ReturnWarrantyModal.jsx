import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCornerUpLeft, FiShield, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import CustomerInfoFields from "./OrderComponents/CustomerInfoFields";
import ProductSearchPanel from "./OrderComponents/ProductSearchPanel";
import TransferTypeSelector from "./OrderComponents/TransferTypeSelector";
import { WareHouseContext } from "../../../Contexts/WareHouseContext/WareHouseContext";
import { createReturnClaim } from "./api";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const emptyCustomer = {
  username: "",
  mobile: "",
  email: "",
  address: "",
  accountId: null,
};

const CLAIM_TYPE_OPTIONS = [
  { id: "return", label: "Return" },
  { id: "warranty", label: "Warranty Claim" },
];

const CONFIG = {
  return: {
    title: "Customer Return",
    icon: FiCornerUpLeft,
    submitLabel: "Log Return",
    accent: "bg-amber-600 hover:bg-amber-700",
  },
  warranty: {
    title: "Warranty Claim",
    icon: FiShield,
    submitLabel: "Log Claim",
    accent: "bg-purple-600 hover:bg-purple-700",
  },
};

const REASON_OPTIONS = {
  return: ["Changed mind", "Wrong item delivered", "Damaged in transit", "Not as described", "Other"],
  warranty: ["Manufacturing defect", "Stopped working", "Damaged under normal use", "Missing parts", "Other"],
};

const RESOLUTION_OPTIONS = ["Refund", "Replace", "Repair", "Store Credit", "Reject"];

const ReturnWarrantyModal = ({ isOpen, onClose, onCreated }) => {
  const [claimType, setClaimType] = useState("return");
  const [customer, setCustomer] = useState(emptyCustomer);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState(REASON_OPTIONS.return[0]);
  const [resolution, setResolution] = useState(RESOLUTION_OPTIONS[0]);
  const [refundAmount, setRefundAmount] = useState(0);
  const [orderReference, setOrderReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { selectedWarehouseId } = useContext(WareHouseContext);

  if (!isOpen) return null;

  const config = CONFIG[claimType];
  const Icon = config.icon;
  const mrp = Number(product?.pricing?.mrp) || 0;
  const lineTotal = mrp * (Number(qty) || 0);

  const handleClaimTypeChange = (type) => {
    setClaimType(type);
    setReason(REASON_OPTIONS[type][0]);
  };

  const handleSelectProduct = (p) => {
    setProduct(p);
    setQty(1);
    setRefundAmount(Number(p.pricing?.mrp) || 0);
  };

  const bumpQty = (delta) => setQty((q) => Math.max(1, (Number(q) || 0) + delta));

  const resetForm = () => {
    setClaimType("return");
    setCustomer(emptyCustomer);
    setProduct(null);
    setQty(1);
    setReason(REASON_OPTIONS.return[0]);
    setResolution(RESOLUTION_OPTIONS[0]);
    setRefundAmount(0);
    setOrderReference("");
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (
      !customer.accountId &&
      (!customer.username.trim() || !customer.mobile.trim())
    ) {
      setError("Username and mobile are required for new customers");
      return;
    }
    if (!product) {
      setError(`Select the product being ${claimType === "return" ? "returned" : "claimed"}`);
      return;
    }
    if (Number(qty) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (resolution === "Refund" && Number(refundAmount) <= 0) {
      setError("Enter a refund amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: claimType,
        warehouseId: selectedWarehouseId,
        productInfo: product._id,
        productName: product.name,
        sku: product.sku,
        qty: Number(qty) || 1,
        reason,
        resolution,
        refundAmount: resolution === "Refund" ? Number(refundAmount) || 0 : 0,
        orderReference,
        notes,
      };

      if (customer?.accountId) {
        payload.customerId = customer.accountId;
      } else {
        payload.username = customer.username;
        payload.mobile = customer.mobile;
        payload.address = customer.address;
        payload.email = customer.email;
      }

      const res = await createReturnClaim(payload);
      onCreated?.(res.data?.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <div className="flex items-center gap-2">
            <Icon className="text-emerald-600" size={18} />
            <h3 className="font-bold text-emerald-900">{config.title}</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <TransferTypeSelector
            label="Claim Type"
            options={CLAIM_TYPE_OPTIONS}
            value={claimType}
            onChange={handleClaimTypeChange}
          />

          <div>
            <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-2">
              Customer Details
            </h4>
            <CustomerInfoFields
              customer={customer}
              onChange={(patch) => setCustomer((prev) => ({ ...prev, ...patch }))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
              Order / Receipt Reference (optional)
            </label>
            <input
              type="text"
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="Original receipt or order number"
              className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
          </div>

          {!product ? (
            <ProductSearchPanel onSelectProduct={handleSelectProduct} />
          ) : (
            <div>
              <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-2">
                Product
              </h4>
              <div className="p-2.5 rounded-lg border border-emerald-300/30 bg-emerald-50/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={product.image?.header}
                    alt={product.name}
                    className="w-9 h-9 rounded-md object-cover border border-emerald-300/40 bg-white shrink-0"
                    onError={(e) => (e.target.style.visibility = "hidden")}
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-emerald-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-emerald-700/50">SKU: {product.sku}</p>
                  </div>
                </div>

                <div className="flex items-center border border-emerald-300/50 rounded overflow-hidden bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => bumpQty(-1)}
                    className="w-6 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 disabled:opacity-30"
                    disabled={Number(qty) <= 1}
                  >
                    <FiMinus size={11} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-9 text-xs text-center py-1 border-x border-emerald-300/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => bumpQty(1)}
                    className="w-6 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50"
                  >
                    <FiPlus size={11} />
                  </button>
                </div>

                <p className="text-xs font-bold text-emerald-900 shrink-0">
                  {currency}
                  {lineTotal.toLocaleString()}
                </p>

                <button
                  type="button"
                  onClick={() => setProduct(null)}
                  className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
                  title="Change product"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
              >
                {REASON_OPTIONS[claimType].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
              >
                {RESOLUTION_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {resolution === "Refund" && (
            <div>
              <label className="block text-[10px] font-bold text-rose-700/60 uppercase mb-1">
                Refund Amount ({currency})
              </label>
              <input
                type="number"
                min={0}
                value={refundAmount}
                onChange={(e) => setRefundAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-rose-300/60 bg-rose-50/40 text-rose-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/40"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Condition of the item, anything worth noting..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
            />
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}
        </div>

        <div className="p-4 border-t border-emerald-300/30 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50 ${config.accent}`}
          >
            {isSubmitting ? "Saving..." : config.submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReturnWarrantyModal;