import { useState } from "react";
import { FiX } from "react-icons/fi";
import { commonComponentBG } from "../../../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../../../Theme/secondaryButton";
import { primaryButton } from "../../../../../Theme/primaryButton";
import { commonInputField } from "../../../../../Theme/commonInputField";
import { createSupplier } from "./api";

const emptyForm = {
  suppliersName: "",
  supplierCode: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  contactPerson: "",
  email: "",
  phone: "",
  taxId: "",
  status: "Active",
  notes: "",
};

const SupplierAddModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const setFormField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.suppliersName.trim() || !form.supplierCode.trim()) {
      setError("Supplier suppliersName and code are required");
      return;
    }
    if (!form.city.trim() || !form.country.trim()) {
      setError("City and Country are required fields");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload = {
      suppliersName: form.suppliersName,
      supplierCode: form.supplierCode,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
      },
      contact: {
        person: form.contactPerson,
        email: form.email || undefined,
        phone: form.phone,
      },
      financials: {
        taxId: form.taxId,
      },
      status: form.status,
      notes: form.notes,
    };

    try {
      const res = await createSupplier(payload);
      if (res.data?.success) {
        onCreated(res.data.data);
        onClose();
      } else {
        setError("Could not create supplier");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not create supplier");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-emerald-950/30 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full max-w-2xl rounded-2xl cursor-default flex flex-col max-h-[90vh]`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/40 bg-emerald-50 rounded-t-2xl">
          <h3 className="text-base font-bold text-emerald-900">
            Add New Supplier
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-white/80 hover:bg-white text-emerald-800"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Modal Body - Scrollable if content grows */}
        <div className="p-4 flex flex-col gap-5 overflow-y-auto">
          {/* Section: Basic Info */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 mb-2 tracking-wide uppercase">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={form.suppliersName}
                  onChange={(e) =>
                    setFormField("suppliersName", e.target.value)
                  }
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Supplier Code *
                </label>
                <input
                  type="text"
                  value={form.supplierCode}
                  onChange={(e) => setFormField("supplierCode", e.target.value)}
                  className={commonInputField}
                />
              </div>
            </div>
          </div>

          {/* Section: Address Details */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 mb-2 tracking-wide uppercase">
              Address Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Street Address
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setFormField("street", e.target.value)}
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  City *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setFormField("city", e.target.value)}
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  State / Province
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setFormField("state", e.target.value)}
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Zip / Postal Code
                </label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setFormField("zipCode", e.target.value)}
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Country *
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setFormField("country", e.target.value)}
                  className={commonInputField}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Financial Info */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 mb-2 tracking-wide uppercase">
              Contact & Financials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setFormField("contactPerson", e.target.value)
                  }
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setFormField("email", e.target.value)}
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setFormField("phone", e.target.value)}
                  className={commonInputField}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Tax ID / VAT Number
                </label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) => setFormField("taxId", e.target.value)}
                  className={commonInputField}
                />
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setFormField("status", e.target.value)}
                  className={`${commonInputField} bg-white h-[38px]`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setFormField("notes", e.target.value)}
              className={`${commonInputField} resize-none py-1.5`}
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-emerald-300/40 bg-emerald-50 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`${primaryButton} bg-[#1D9E75] text-white disabled:opacity-50`}
          >
            {isSaving ? "Saving..." : "Save Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierAddModal;
