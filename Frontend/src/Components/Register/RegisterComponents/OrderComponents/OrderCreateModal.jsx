import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { FiX, FiShoppingCart } from "react-icons/fi";
import CustomerInfoFields from "./CustomerInfoFields";
import ProductSearchPanel from "./ProductSearchPanel";
import CartItemsList from "./CartItemsList";
import CheckoutSummary from "./CheckoutSummary";
import { createOrder, completeOrder } from "../api";
import { WareHouseContext } from "../../../../Contexts/WareHouseContext/WareHouseContext";

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

  const { selectedWarehouseId } = useContext(WareHouseContext);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0,
  );

  const discountAmount = Math.min(
    Math.max(Math.ceil(Number(discount) || 0), 0),
    subtotal,
  );
  const total = Math.max(subtotal - discountAmount, 0);

  // Adds a product with a default shelf auto-picked (lowest stock among
  // product.shelveData), or no shelf at all when the product has none.
  // The rack/shelf — including dropping it entirely via "No Shelf" — can
  // be changed afterward right on the cart row, inline in this same modal.
  // Same product added again merges into whichever existing line already
  // has that same shelf resolved; a different shelf gets its own line,
  // since it represents physically different stock.
  const handleSelectProduct = (product) => {
    const shelves = product.shelveData || [];
    const totalStock = Number(product.stock) || 0;
    const totalWarningStock = shelves.reduce(
      (sum, s) => sum + (Number(s.stock?.warningStock) || 0),
      0,
    );

    const defaultShelf = shelves.length
      ? [...shelves].sort(
          (a, b) => (Number(a.stock?.inStock) || 0) - (Number(b.stock?.inStock) || 0),
        )[0]
      : null;

    const shelfId = defaultShelf?.shelfId || null;
    const rackId = defaultShelf?.rackData?._id || null;
    const rackCode = defaultShelf?.rackData?.rackCode || null;
    const shelfCode = defaultShelf?.shelfCode || null;
    const stock = defaultShelf ? Number(defaultShelf.stock?.inStock) || 0 : totalStock;
    const warningStock = defaultShelf
      ? Number(defaultShelf.stock?.warningStock) || 0
      : totalWarningStock;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product._id && i.shelfId === shelfId,
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, qty: Number(i.qty) + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          cartId: `${product._id}-${shelfId || "nolocation"}-${Date.now()}`,
          productId: product._id,
          name: product.name,
          sku: product.sku,
          brand: product.brand,
          qty: 1,
          price: product.pricing?.mrp ?? 0,
          image: product.image?.header || "",
          shelves, // raw shelveData — CartItemsList builds its rack/shelf selects from this
          totalStock,
          totalWarningStock,
          stock,
          warningStock,
          rackId,
          rackCode,
          shelfId,
          shelfCode,
        },
      ];
    });
  };

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
    // The backend pulls stock from a single shelf for the whole order (it
    // only reads one location, not one per item), so every shelved line
    // here has to point at the same shelf. Items for products with no
    // shelf on file at all just don't carry a location — that's fine.
    const shelfIds = [...new Set(items.map((i) => i.shelfId).filter(Boolean))];
    if (shelfIds.length > 1) {
      setError(
        "All items in one order must come from the same shelf — split items on different shelves into separate orders",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const paid = Math.max(Number(payAmount) || 0, 0);

      const itemsFormatted = items.map((item) => ({
        productInfo: item.productId,
        qty: item.qty,
        price: item.price,
      }));

      const orderPayload = {
        items: itemsFormatted,
        warehouseId: selectedWarehouseId,
        // Order-level fulfillment status — separate from payment.status.
        // Paid in full at creation -> complete. Anything less -> pending,
        // and stays pending until someone explicitly marks it complete.
        status: paid >= total ? "complete" : "pending",
        payment: {
          paidAmount: paid,
          discountAmount: discountAmount,
          subtotal: subtotal,
          total: total,
          status: paymentStatus.toLowerCase(),
        },
      };

      if (shelfIds.length === 1) {
        orderPayload.location = { shelveId: shelfIds[0] };
      }

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
      handleClose();

      // Already complete (fully paid) — nothing further needed, no alert.
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
    } catch (err) {
      setError(err.response?.data?.message || "Could not create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
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

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
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