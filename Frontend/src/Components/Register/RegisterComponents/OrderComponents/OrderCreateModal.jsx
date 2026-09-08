import { useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FiX, FiShoppingCart } from "react-icons/fi";
import CustomerInfoFields from "./CustomerInfoFields";
import ProductSearchPanel from "./ProductSearchPanel";
import CartItemsList from "./CartItemsList";
import CheckoutSummary from "./CheckoutSummary";
import {
  createOrder,
  completeOrder,
  deliverOrder,
  confirmOrder,
  searchProductsByBarcode,
} from "../api";
import useBarcodeScanner from "../../../../Hooks/useBarcodeScanner";
import { WareHouseContext } from "../../../../Contexts/WareHouseContext/WareHouseContext";
import CashMemoModal from "./Cashmemomodal";

let cartLineSeq = 0;

const emptyCustomer = {
  username: "",
  mobile: "",
  email: "",
  address: "",
  accountId: null,
};

const OrderCreateModal = ({ isOpen, onClose, onCreated }) => {
  const [customer, setCustomer] = useState(emptyCustomer);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [payAmount, setPayAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Receipt shown right after a successful save. Kept as component state
  // (not gated behind `isOpen`) so it survives handleClose() flipping
  // isOpen to false — see the guard below.
  const [receiptOrder, setReceiptOrder] = useState(null);
  // The delivered/mark-complete follow-up Swal flow runs *after* the
  // receipt is dismissed, so it's stashed here rather than run inline.
  const followUpRef = useRef(null);

  const { selectedWarehouseId } = useContext(WareHouseContext);

  const buildCartLine = (
    product,
    shelf,
    qty,
    totalStock,
    totalWarningStock,
  ) => {
    const shelfId = shelf?.shelfId || null;
    const rackId = shelf?.rackData?._id || null;
    const rackCode = shelf?.rackData?.rackCode || null;
    const shelfCode = shelf?.shelfCode || null;
    const stock = shelf ? Number(shelf.stock?.inStock) || 0 : totalStock;
    const warningStock = shelf
      ? Number(shelf.stock?.warningStock) || 0
      : totalWarningStock;

    return {
      cartId: `${product._id}-${shelfId || "nolocation"}-${Date.now()}-${cartLineSeq++}`,
      productId: product._id,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      qty,
      price: product.pricing?.mrp ?? 0,
      image: product.image?.header || "",
      shelves: product.shelveData || [],
      totalStock,
      totalWarningStock,
      stock,
      warningStock,
      rackId,
      rackCode,
      shelfId,
      shelfCode,
    };
  };

  // explicitShelf = the shelf the user actually picked (single-shelf
  // product, or their choice from the multi-shelf location picker) —
  // always goes to that exact line, never redistributed.
  // No explicitShelf (barcode scans, repeat search clicks) -> auto-fill
  // lowest-stock shelf first, spill the overflow into the next-lowest
  // shelf once the current one's stock is used up.
  const handleSelectProduct = (product, explicitShelf, qty = 1) => {
    const shelves = product.shelveData || [];
    const totalStock = Number(product.stock) || 0;
    const totalWarningStock = shelves.reduce(
      (sum, s) => sum + (Number(s.stock?.warningStock) || 0),
      0,
    );

    setItems((prev) => {
      let next = [...prev];

      if (shelves.length === 0) {
        const existing = next.find(
          (i) => i.productId === product._id && !i.shelfId,
        );
        if (existing) {
          return next.map((i) =>
            i === existing ? { ...i, qty: Number(i.qty) + qty } : i,
          );
        }
        return [
          ...next,
          buildCartLine(product, null, qty, totalStock, totalWarningStock),
        ];
      }

      if (explicitShelf) {
        const existing = next.find(
          (i) =>
            i.productId === product._id && i.shelfId === explicitShelf.shelfId,
        );
        if (existing) {
          return next.map((i) =>
            i === existing ? { ...i, qty: Number(i.qty) + qty } : i,
          );
        }
        return [
          ...next,
          buildCartLine(
            product,
            explicitShelf,
            qty,
            totalStock,
            totalWarningStock,
          ),
        ];
      }

      const sortedShelves = [...shelves].sort(
        (a, b) =>
          (Number(a.stock?.inStock) || 0) - (Number(b.stock?.inStock) || 0),
      );

      let remaining = qty;
      for (const shelf of sortedShelves) {
        if (remaining <= 0) break;

        const capacity = Number(shelf.stock?.inStock) || 0;
        const existing = next.find(
          (i) => i.productId === product._id && i.shelfId === shelf.shelfId,
        );
        const alreadyAllocated = existing ? Number(existing.qty) : 0;
        const roomLeft = capacity - alreadyAllocated;
        if (roomLeft <= 0) continue;

        const take = Math.min(roomLeft, remaining);
        remaining -= take;

        next = existing
          ? next.map((i) =>
              i === existing ? { ...i, qty: Number(i.qty) + take } : i,
            )
          : [
              ...next,
              buildCartLine(
                product,
                shelf,
                take,
                totalStock,
                totalWarningStock,
              ),
            ];
      }

      // Every shelf already full — dump leftover on the highest-stock
      // shelf so it's not silently lost; the existing "exceeds available
      // stock" warning on that line flags it.
      if (remaining > 0) {
        const lastShelf = sortedShelves[sortedShelves.length - 1];
        const existing = next.find(
          (i) => i.productId === product._id && i.shelfId === lastShelf.shelfId,
        );
        next = existing
          ? next.map((i) =>
              i === existing ? { ...i, qty: Number(i.qty) + remaining } : i,
            )
          : [
              ...next,
              buildCartLine(
                product,
                lastShelf,
                remaining,
                totalStock,
                totalWarningStock,
              ),
            ];
      }

      return next;
    });
  };

  // Barcode scanner support — while the modal is open, a fast burst of
  // keystrokes ending in Enter is treated as a scanned code. We look the
  // code up via GET /api/product/get?barcodes=<code>, and auto-add the
  // product if ANY of its barcodes matches the scanned code exactly
  // (a product can have multiple barcodes — unit/case/pallet — so we
  // can't just check the first one).
  const handleBarcodeScanned = useCallback(
    async (code) => {
      console.log("SCANNED CODE:", code);
      const normalize = (s) => (s || "").trim().toLowerCase();
      const scanned = normalize(code);

      try {
        const res = await searchProductsByBarcode(code, selectedWarehouseId);
        const products = res.data?.data || [];

        const match = products.find((p) =>
          (p.barcodes || []).some((b) => normalize(b.code) === scanned),
        );

        if (match) {
          handleSelectProduct(match);
          toast.success(`Scanned: ${match.name}`);
        } else {
          toast.error(`No product matches barcode "${code}"`);
        }
      } catch (err) {
        console.error("Barcode scan lookup failed:", err);
        toast.error("Could not look up scanned barcode");
      }
    },
    [selectedWarehouseId],
  );

  useBarcodeScanner(handleBarcodeScanned, isOpen);

  // Stays mounted (rendering only the receipt) even after isOpen flips to
  // false, so the receipt modal isn't unmounted mid-flow by handleClose().
  if (!isOpen && !receiptOrder) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0,
  );

  const discountAmount = Math.min(
    Math.max(Math.ceil(Number(discount) || 0), 0),
    subtotal,
  );
  const total = Math.max(subtotal - discountAmount, 0);

  const handleUpdateItem = (cartId, patch) => {
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, ...patch } : i)),
    );
  };

  const handleRemoveItem = (cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const resetForm = () => {
    setCustomer(emptyCustomer);
    setItems([]);
    setDiscount(0);
    setPaymentStatus("Paid");
    setPayAmount(0);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Runs once the receipt modal is dismissed — this is exactly the
  // delivered/mark-complete logic that used to run right after saving,
  // just deferred so the receipt appears first.
  const handleReceiptClose = async () => {
    setReceiptOrder(null);
    const followUp = followUpRef.current;
    followUpRef.current = null;
    await followUp?.();
  };

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (
      !customer.accountId &&
      (!customer.username.trim() || !customer.mobile.trim())
    ) {
      setError("Username and mobile are required for new customers");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one product");
      return;
    }

    const paid = Math.max(Number(payAmount) || 0, 0);

    // Nothing paid at all — nudge for at least a small payment before
    // creating the order. Declining still creates the order (status
    // stays "pending").
    if (paid === 0) {
      const result = await Swal.fire({
        icon: "info",
        title: "No payment added",
        text: "Add at least a small payment to confirm this order, or continue without payment.",
        showCancelButton: true,
        confirmButtonText: "Add Payment",
        cancelButtonText: "Continue Without Payment",
        confirmButtonColor: "#1D9E75",
      });

      // They want to add payment first — back out and let them edit the
      // Pay field instead of submitting.
      if (result.isConfirmed) return;
    }

    setIsSubmitting(true);
    try {
      // Each line carries its own shelveId, so one order can pull stock
      // from several different shelves — items missing a shelf just omit
      // shelveId (matches "no shelf on file" products).
      const itemsFormatted = items.map((item) => ({
        productInfo: item.productId,
        qty: item.qty,
        price: item.price,
        ...(item.shelfId ? { shelveId: item.shelfId } : {}),
      }));

      const orderPayload = {
        items: itemsFormatted,
        warehouseId: selectedWarehouseId,
        // Order-level fulfillment status — separate from payment.status.
        // Paid in full (or more) at creation -> confirm, pending a
        // delivery confirmation below. Anything less -> pending.
        status: paid >= total ? "confirm" : "pending",
        payment: {
          paidAmount: paid,
          discountAmount: discountAmount,
          subtotal: subtotal,
          total: total,
          status: paymentStatus.toLowerCase(),
        },
      };

      if (customer?.accountId) {
        orderPayload.customerId = customer.accountId;
      } else {
        orderPayload.username = customer.username;
        orderPayload.mobile = customer.mobile;
        orderPayload.address = customer.address;
        orderPayload.email = customer.email;
      }

      const res = await createOrder(orderPayload);
      const savedOrder = res.data?.data;
      onCreated?.(savedOrder);

      // Capture these now — resetForm()/handleClose() below zero out the
      // payAmount state, and the follow-up needs the values as they were
      // at submit time.
      const paidAtSubmit = paid;
      const totalAtSubmit = total;

      handleClose();

      // Defer the delivered/mark-complete conversation until after the
      // person has had a chance to print the receipt.
      followUpRef.current = async () => {
        // Paid in full (or more) — ask whether it already went out the door.
        if (paidAtSubmit >= totalAtSubmit) {
          const result = await Swal.fire({
            icon: "question",
            title: "Was it delivered?",
            text: "Have the products already been handed over to the customer?",
            showCancelButton: true,
            confirmButtonText: "Yes, delivered",
            cancelButtonText: "Not yet",
            confirmButtonColor: "#1D9E75",
          });

          try {
            if (result.isConfirmed) {
              await deliverOrder(savedOrder._id);
            } else {
              await confirmOrder(savedOrder._id);
            }
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Could not update order status",
              text: err.response?.data?.message || "Please try again.",
            });
          }
          return;
        }

        // Not fully paid — offer the existing "mark complete later" path.
        if (savedOrder?.status !== "complete") {
          const result = await Swal.fire({
            icon: "warning",
            title: "Order is pending",
            text: "This order hasn't been marked complete yet.",
            showCancelButton: true,
            confirmButtonText: "Mark Complete",
            cancelButtonText: "Later",
            confirmButtonColor: "#1D9E75",
          });

          if (result.isConfirmed) {
            try {
              await completeOrder(savedOrder._id);
              await Swal.fire({
                icon: "success",
                title: "Order completed",
                timer: 1500,
                showConfirmButton: false,
              });
            } catch (err) {
              Swal.fire({
                icon: "error",
                title: "Could not complete order",
                text: err.response?.data?.message || "Please try again.",
              });
            }
          }
        }
      };

      // Show the receipt now — the follow-up above runs once it's closed.
      setReceiptOrder(savedOrder);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (receiptOrder) {
    return <CashMemoModal order={receiptOrder} onClose={handleReceiptClose} />;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl min-w-0 bg-white rounded-2xl shadow-xl flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="text-emerald-600" size={18} />
            <h3 className="font-bold text-emerald-900">Make an Order</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-2">
              Customer Details
            </h4>
            <CustomerInfoFields
              customer={customer}
              onChange={(patch) =>
                setCustomer((prev) => ({ ...prev, ...patch }))
              }
            />
          </div>

          <ProductSearchPanel onSelectProduct={handleSelectProduct} />

          <CartItemsList
            items={items}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />

          <CheckoutSummary
            subtotal={subtotal}
            discount={discount}
            onDiscountChange={setDiscount}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={setPaymentStatus}
            payAmount={payAmount}
            onPayAmountChange={setPayAmount}
          />

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
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default OrderCreateModal;
