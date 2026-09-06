import { createPortal } from "react-dom";
import { FiX, FiTruck, FiMapPin, FiHash, FiEdit2, FiStar, FiUser, FiMail, FiPhone, FiFileText } from "react-icons/fi";

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-500 border-slate-200",
  Blacklisted: "bg-rose-50 text-rose-600 border-rose-200",
};

const Field = ({ label, value, icon: Icon }) => (
  <div>
    <p className="flex items-center gap-1.5 text-[16px] font-bold text-emerald-700/60 uppercase tracking-wide">
      {Icon && <Icon size={12} />} {label}
    </p>
    <p className="text-[16px] font-semibold text-emerald-900">
      {value || <span className="text-emerald-700/40 italic font-normal">—</span>}
    </p>
  </div>
);

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar
        key={n}
        size={16}
        className={n <= rating ? "text-amber-500 fill-amber-500" : "text-emerald-200"}
      />
    ))}
    <span className="text-[16px] text-emerald-700/60 ml-1">{rating}/5</span>
  </div>
);

// Read-only view of a supplier's full details, matching the real schema
// (address, contact, financials, rating, notes). Offers an "Edit" button
// that hands off to SupplierEditModal via onEdit.
const SupplierDetailModal = ({ supplier, onClose, onEdit }) => {
  const address = supplier.address || {};
  const contact = supplier.contact || {};
  const financials = supplier.financials || {};

  const addressLine = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(", ");

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <div className="flex items-center gap-2">
            <FiTruck className="text-emerald-600" size={18} />
            <h3 className="font-bold text-emerald-900 text-[16px]">Supplier Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[16px] font-black text-emerald-900 truncate">
                {supplier.suppliersName}
              </p>
              <p className="flex items-center gap-1 text-[16px] text-emerald-700/60">
                <FiHash size={12} /> {supplier.supplierCode || "—"}
              </p>
            </div>
            <span
              className={`text-[16px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                STATUS_STYLES[supplier.status] || STATUS_STYLES.Active
              }`}
            >
              {supplier.status}
            </span>
          </div>

          <StarRating rating={supplier.rating} />

          <div className="border-t border-emerald-300/20 pt-3 flex flex-col gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[16px] font-bold text-emerald-700/60 uppercase tracking-wide">
                <FiMapPin size={12} /> Address
              </p>
              <p className="text-[16px] font-semibold text-emerald-900">
                {addressLine || (
                  <span className="text-emerald-700/40 italic font-normal">
                    No address on file
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="border-t border-emerald-300/20 pt-3">
            <p className="text-[16px] font-bold text-emerald-800 uppercase mb-2">Contact</p>
            <div className="grid grid-cols-1 gap-2.5">
              <Field icon={FiUser} label="Contact Person" value={contact.person} />
              <Field icon={FiMail} label="Email" value={contact.email} />
              <Field icon={FiPhone} label="Phone" value={contact.phone} />
            </div>
          </div>

          <div className="border-t border-emerald-300/20 pt-3">
            <Field icon={FiFileText} label="Tax ID" value={financials.taxId} />
          </div>

          {supplier.notes && (
            <div className="border-t border-emerald-300/20 pt-3">
              <p className="text-[16px] font-bold text-emerald-700/60 uppercase mb-1">Notes</p>
              <p className="text-[16px] text-emerald-800 bg-emerald-50/40 border border-emerald-300/30 rounded-lg p-3">
                {supplier.notes}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-emerald-300/30 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-[16px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-[16px] text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors"
          >
            <FiEdit2 size={14} /> Edit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SupplierDetailModal;