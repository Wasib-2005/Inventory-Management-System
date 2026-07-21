import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiShoppingCart } from "react-icons/fi";
import CustomerInfoFields from "./CustomerInfoFields";
import ProductSearchPanel from "./ProductSearchPanel";
import CartItemsList from "./CartItemsList";
import CheckoutSummary from "./CheckoutSummary";
import { createOrder } from "../api";
import { useWarehouseDetails } from "./useWarehouseDetails";

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

  const { selectedWarehouseId, warehouse } = useWarehouseDetails();

  // The product search API returns shelveData with shelfId but no rackId,
  // so we resolve rackId ourselves from the warehouse's own rack/shelf
  // hierarchy (same data StockMovementModal/CycleCountShelfEntry use).
  const rackIdByShelfId = useMemo(() => {
    const map = {};
    (warehouse?.rackdata || []).forEach((rack) => {
      (rack.shelfData || []).forEach((shelf) => {
        map[shelf._id] = rack._id;
      });
    });
    return map;
  }, [warehouse]);

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

  // shelf is an entry from product.shelveData ({ rackId, rackCode, shelfId,
  // shelfCode, stock: { inStock, ... } }), or null when the product has no
  // shelveData. Same product on two different shelves is two cart lines,
  // since they represent physically different stock.
  const handleSelectProduct = (product, shelf) => {
    const shelfId = shelf?.shelfId || null;
    const rackId = shelf?.rackId || (shelfId ? rackIdByShelfId[shelfId] : null) || null;
    const stock = shelf ? Number(shelf.stock?.inStock) || 0 : Number(product.stock) || 0;

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
          stock,
          rackCode: shelf?.rackCode || null,
          shelfCode: shelf?.shelfCode || null,
          shelfId,
          rackId,
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

    setIsSubmitting(true);
    try {
      const paid = Math.max(Number(payAmount) || 0, 0);

      const itemsFormatted = items.map((item) => ({
        productInfo: item.productId,
        qty: item.qty,
        price: item.price,
        location: {
          rackId: item.rackId || null,
          shelveId: item.shelfId || null,
        },
      }));

      const orderPayload = {
        items: itemsFormatted,
        warehouseId: selectedWarehouseId,
        payment: {
          paidAmount: paid,
          discountAmount: discountAmount,
          subtotal: subtotal,
          total: total,
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
      onCreated?.(res.data?.data);
      handleClose();
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
            {isSubmitting ? "Placing Order..." : "Complete Order"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default OrderCreateModal;