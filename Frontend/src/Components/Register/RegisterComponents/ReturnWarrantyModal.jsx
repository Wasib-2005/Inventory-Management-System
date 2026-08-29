import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiCornerUpLeft,
  FiShield,
  FiTool,
  FiMinus,
  FiPlus,
  FiSearch,
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { AiOutlineBarcode } from "react-icons/ai";
import TransferTypeSelector from "./OrderComponents/TransferTypeSelector";
import useBarcodeScanner from "../../../Hooks/useBarcodeScanner";
import { getOrderById, createOrderServiceClaim } from "./api";
import { makeImageUrl } from "../../../Service/auth/makeImageUrl";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const RETURN_WINDOW_DAYS = Number(import.meta.env.VITE_RETURN_WINDOW_DAYS) || 0;
const RETURNS_ENABLED = RETURN_WINDOW_DAYS > 0;

const CLAIM_TYPE_OPTIONS = RETURNS_ENABLED
  ? [
      { id: "return", label: "Return" },
      { id: "warranty", label: "Warranty Claim" },
      { id: "guarantee", label: "Guarantee Claim" },
    ]
  : [
      { id: "warranty", label: "Warranty Claim" },
      { id: "guarantee", label: "Guarantee Claim" },
    ];

const DEFAULT_CLAIM_TYPE = RETURNS_ENABLED ? "return" : "warranty";

const PRODUCT_DAYS_FIELD = {
  warranty: "warranty",
  guarantee: "guarantee",
};

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
  guarantee: {
    title: "Guarantee Claim",
    icon: FiTool,
    submitLabel: "Log Claim",
    accent: "bg-blue-600 hover:bg-blue-700",
  },
};

const REASON_OPTIONS = {
  return: ["Changed mind", "Wrong item delivered", "Damaged in transit", "Not as described", "Other"],
  warranty: ["Manufacturing defect", "Stopped working", "Damaged under normal use", "Missing parts", "Other"],
  guarantee: ["Manufacturing defect", "Stopped working", "Damaged under normal use", "Missing parts", "Other"],
};

const RESOLUTION_OPTIONS = {
  return: ["Refund", "Replace", "Repair", "Store Credit", ],
  warranty: ["Replace"],
  guarantee: ["Repair"],
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
};

const daysSince = (dateString) => {
  const then = new Date(dateString).getTime();
  return Math.floor((Date.now() - then) / 86400000);
};

const getEligibility = (item, claimType, purchaseDate) => {
  const since = daysSince(purchaseDate);

  if (claimType === "return") {
    return {
      eligible: since <= RETURN_WINDOW_DAYS,
      since,
      limitDays: RETURN_WINDOW_DAYS,
      noPolicy: false,
    };
  }

  const field = PRODUCT_DAYS_FIELD[claimType];
  const limitDays = Number(item.product?.[field]) || 0;
  if (limitDays <= 0) {
    return { eligible: false, since, limitDays: 0, noPolicy: true };
  }
  return {
    eligible: since <= limitDays,
    since,
    limitDays,
    noPolicy: false,
  };
};

const getCustomerInfo = (order) => {
  if (order.customerId) {
    return {
      username: order.customerId.username,
      email: order.customerId.email,
      phone: order.customerId.phone,
      isGuest: false,
    };
  }
  return {
    username: order.username || "Walk-in",
    email: order.email || null,
    phone: order.mobile || null,
    isGuest: true,
  };
};

const ReturnWarrantyModal = ({ isOpen, onClose, onCreated }) => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [order, setOrder] = useState(null);

  const [claimType, setClaimType] = useState(DEFAULT_CLAIM_TYPE);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState(REASON_OPTIONS[DEFAULT_CLAIM_TYPE][0] || "");
  const [resolution, setResolution] = useState(RESOLUTION_OPTIONS[DEFAULT_CLAIM_TYPE][0]);
  const [refundAmount, setRefundAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const step = order ? "claim" : "lookup";

  const handleSearchOrder = async (idOverride) => {
    const id = (idOverride ?? orderIdInput).trim();
    if (!id) {
      setOrderError("Enter or scan an order ID");
      return;
    }
    setIsSearchingOrder(true);
    setOrderError("");
    try {
      const res = await getOrderById(id);
      setOrder(res.data?.data || null);
    } catch (err) {
      setOrderError(
        err.response?.data?.message || "Order not found — check the ID and try again",
      );
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const handleScannedOrderId = (code) => {
    setOrderIdInput(code);
    handleSearchOrder(code);
  };

  useBarcodeScanner(handleScannedOrderId, isOpen && step === "lookup");

  const handleClaimTypeChange = (type) => {
    setClaimType(type);
    setSelectedItemId(null);
    setReason(REASON_OPTIONS[type][0]);
    setResolution(RESOLUTION_OPTIONS[type][0]);
  };

  const items = order?.items || [];
  const selectedItem = items.find((i) => i._id === selectedItemId) || null;

  const handleSelectItem = (item, eligibility) => {
    if (!eligibility.eligible) return;
    setSelectedItemId(item._id);
    setQty(1);
    setRefundAmount(Number(item.product?.pricing?.mrp ?? item.price) || 0);
  };

  const bumpQty = (delta) =>
    setQty((q) => {
      const max = Number(selectedItem?.qty) || 1;
      return Math.min(max, Math.max(1, (Number(q) || 0) + delta));
    });

  const resetForm = () => {
    setOrderIdInput("");
    setOrderError("");
    setOrder(null);
    setClaimType(DEFAULT_CLAIM_TYPE);
    setSelectedItemId(null);
    setQty(1);
    setReason(REASON_OPTIONS[DEFAULT_CLAIM_TYPE][0] || "");
    setResolution(RESOLUTION_OPTIONS[DEFAULT_CLAIM_TYPE][0]);
    setRefundAmount(0);
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackToLookup = () => {
    setOrder(null);
    setOrderIdInput("");
    setOrderError("");
    setSelectedItemId(null);
  };

  if (!isOpen) return null;

  const config = CONFIG[claimType];
  const Icon = config.icon;
  const mrp = Number(selectedItem?.product?.pricing?.mrp ?? selectedItem?.price) || 0;
  const lineTotal = mrp * (Number(qty) || 0);
  const customer = order ? getCustomerInfo(order) : null;

  const handleSubmit = async () => {
    setError("");

    if (!selectedItem) {
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
    if (claimType === "return" && !reason) {
      setError("Select a reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        order: order._id,
        product: selectedItem.product?._id,
        warehouse: order.warehouseData,
        type: claimType, // "return" | "warranty" | "guarantee"
        qty: Number(qty) || 1,
        reason: reason,
        notes: notes,
        resolution,
        refundAmount: resolution === "Refund" ? Number(refundAmount) || 0 : 0,
        customer: order.customerId ? order.customerId._id : null,
        // fallback contact info for guest/walk-in orders with no linked account
        guestInfo: order.customerId
          ? undefined
          : {
              username: customer.username,
              mobile: customer.phone,
              email: customer.email,
            },
      };

      const res = await createOrderServiceClaim(payload);
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
            {step === "claim" ? (
              <Icon className="text-emerald-600" size={18} />
            ) : (
              <AiOutlineBarcode className="text-emerald-600" size={18} />
            )}
            <h3 className="font-bold text-emerald-900">
              {step === "claim" ? config.title : "Find Order"}
            </h3>
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
          {step === "lookup" && (
            <>
              <p className="text-xs text-emerald-700/50 -mt-1">
                Scan the order's barcode, or type/paste the order ID below.
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FiSearch
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40"
                  />
                  <input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchOrder()}
                    placeholder="Order ID..."
                    autoFocus
                    className="w-full text-sm pl-8 pr-3 py-2.5 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchOrder()}
                  disabled={isSearchingOrder}
                  className="px-4 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors disabled:opacity-50 shrink-0"
                >
                  {isSearchingOrder ? "Searching..." : "Find"}
                </button>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-emerald-700/40">
                <AiOutlineBarcode size={13} />
                Scanner input is picked up automatically while this is open
              </p>

              {orderError && (
                <p className="text-[12px] text-red-500">{orderError}</p>
              )}
            </>
          )}

          {step === "claim" && order && (
            <>
              <button
                type="button"
                onClick={handleBackToLookup}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-700/60 hover:text-emerald-700 self-start"
              >
                <FiArrowLeft size={12} /> Change Order
              </button>

              <div className="rounded-xl border border-emerald-300/40 bg-emerald-50/40 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-700/70">
                    #{String(order._id).slice(-6).toUpperCase()}
                  </span>
                  <span className="text-[11px] text-emerald-700/50">
                    Purchased {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                    <FiUser size={11} /> {customer.username}
                  </p>
                  {customer.email && (
                    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700/60">
                      <FiMail size={11} /> {customer.email}
                    </p>
                  )}
                  {customer.phone && (
                    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700/60">
                      <FiPhone size={11} /> {customer.phone}
                    </p>
                  )}
                </div>
              </div>

              <TransferTypeSelector
                label="Claim Type"
                options={CLAIM_TYPE_OPTIONS}
                value={claimType}
                onChange={handleClaimTypeChange}
              />

              <div>
                <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-2">
                  Select Product
                </h4>
                <div className="flex flex-col gap-2">
                  {items.map((item) => {
                    const eligibility = getEligibility(
                      item,
                      claimType,
                      order.createdAt,
                    );
                    const isSelected = selectedItemId === item._id;

                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleSelectItem(item, eligibility)}
                        disabled={!eligibility.eligible}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40"
                            : eligibility.eligible
                              ? "border-emerald-300/40 bg-white hover:bg-emerald-50/40"
                              : "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"
                        }`}
                      >
                        <img
                          src={makeImageUrl(item.product?.image?.header)}
                          alt={item.product?.name}
                          className="w-9 h-9 rounded-md object-cover border border-emerald-300/40 bg-white shrink-0"
                          onError={(e) =>
                            (e.target.style.visibility = "hidden")
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-emerald-900 truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-[10px] text-emerald-700/50">
                            Qty bought: {item.qty} · {currency}
                            {Number(item.price).toLocaleString()}
                          </p>
                        </div>

                        {eligibility.noPolicy ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full shrink-0">
                            {claimType === "return"
                              ? "Returns Not Configured"
                              : claimType === "guarantee"
                                ? "No Guarantee"
                                : "No Warranty"}
                          </span>
                        ) : eligibility.eligible ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0">
                            <FiCheckCircle size={11} />
                            {eligibility.since}/{eligibility.limitDays}d
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-full shrink-0">
                            <FiXCircle size={11} />
                            Expired
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-[12px] text-emerald-700/40 italic py-3 text-center">
                      This order has no products
                    </p>
                  )}
                </div>
              </div>

              {selectedItem && (
                <>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300/30 bg-emerald-50/40">
                    <div>
                      <label className="block text-[9px] font-bold text-emerald-700/50 uppercase mb-0.5">
                        Qty
                      </label>
                      <div className="flex items-center border border-emerald-300/50 rounded overflow-hidden bg-white">
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
                          max={selectedItem.qty}
                          value={qty}
                          onChange={(e) =>
                            setQty(
                              Math.min(
                                Number(selectedItem.qty) || 1,
                                Math.max(1, Number(e.target.value) || 1),
                              ),
                            )
                          }
                          className="w-9 text-xs text-center py-1 border-x border-emerald-300/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => bumpQty(1)}
                          disabled={Number(qty) >= Number(selectedItem.qty)}
                          className="w-6 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 disabled:opacity-30"
                        >
                          <FiPlus size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-900">
                      {currency}
                      {lineTotal.toLocaleString()}
                    </p>
                  </div>

                  {claimType === "return" && (
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                        Reason <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
                      >
                        {REASON_OPTIONS.return.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                      Resolution
                    </label>
                    {claimType !== "return" ? (
                      <p className="text-sm font-semibold text-emerald-900 px-3 py-2 rounded-lg border border-emerald-300/50 bg-emerald-50/40">
                        {RESOLUTION_OPTIONS[claimType][0]}{" "}
                        <span className="font-normal text-emerald-700/50">
                          — {claimType} claims don't pay out a refund
                        </span>
                      </p>
                    ) : (
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
                      >
                        {RESOLUTION_OPTIONS.return.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {claimType === "return" && resolution === "Refund" && (
                    <div>
                      <label className="block text-[10px] font-bold text-rose-700/60 uppercase mb-1">
                        Refund Amount ({currency})
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={refundAmount}
                        onChange={(e) =>
                          setRefundAmount(
                            Math.max(0, Number(e.target.value) || 0),
                          )
                        }
                        className="w-full text-sm px-3 py-2 rounded-lg border border-rose-300/60 bg-rose-50/40 text-rose-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                      Note (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Condition of the item, anything worth noting..."
                      className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
                    />
                  </div>
                </>
              )}

              {error && <p className="text-[12px] text-red-500">{error}</p>}
            </>
          )}
        </div>

        <div className="p-4 border-t border-emerald-300/30 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Cancel
          </button>
          {step === "claim" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedItem}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50 ${config.accent}`}
            >
              {isSubmitting ? "Saving..." : config.submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReturnWarrantyModal;