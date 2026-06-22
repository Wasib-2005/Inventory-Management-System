import { useState } from "react";
import axios from "axios";
import { IoPersonAddSharp, IoClose } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { IoIosEyeOff } from "react-icons/io";
import { hybridEncrypt } from "../../../../Service/auth/auth";
import { toast } from "react-toastify";
import { commonInputField } from "../../../../Theme/commonInputField";
import { commonComponentBG } from "../../../../Theme/commonComponentBG";
import ManagerField from "../Fields/ManagerField";

const FieldLabel = ({ children, required }) => (
  <div className="text-[11px] text-(--color-text-tertiary) mb-1">
    {children}
    {required && <span className="text-[#A32D2D] ml-0.5">*</span>}
  </div>
);

// Enums from your Mongoose Schema
const GENDER_OPTIONS = ["male", "female", "other"];
const EMP_TYPE_OPTIONS = [
  "full-time",
  "part-time",
  "intern",
  "consultant",
  "contractor",
];
const EMP_STATUS_OPTIONS = [
  "active",
  "onboarding",
  "on-leave",
  "suspended",
  "terminated",
];

const BLANK = {
  // Core & Profile
  firstName: "",
  lastName: "",
  displayName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  language: "en",
  timezone: "UTC",
  // Nested Address
  address: { street: "", city: "", state: "", postalCode: "", country: "" },
  // Employment
  role: "",
  employmentType: "full-time",
  employmentStatus: "onboarding",
  hireDate: "",
  // Emergency
  emergencyContact: { name: "", relationship: "", phone: "" },
};

const getPwStrength = (pw) => {
  if (!pw || pw.length < 8)
    return { w: "20%", bg: "#B4B2A9", label: "Too short" };
  const score = [/[A-Z]/, /[a-z]/, /\d/, /\W/].filter((r) => r.test(pw)).length;
  return (
    {
      1: { w: "30%", bg: "#E24B4A", label: "Weak" },
      2: { w: "55%", bg: "#EF9F27", label: "Fair" },
      3: { w: "75%", bg: "#EF9F27", label: "Medium" },
      4: { w: "100%", bg: "#1D9E75", label: "Strong" },
    }[score] ?? { w: "30%", bg: "#E24B4A", label: "Weak" }
  );
};

const CreateUserModal = ({ onClose, onSubmit, roleOptions }) => {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added submission state

  // Standard setter
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  // Nested setter for address and emergencyContact
  const setNested = (parent, key, value) =>
    setForm((p) => ({ ...p, [parent]: { ...p[parent], [key]: value } }));

  // --- ADDED CREATE LOGIC HERE ---
  const handleSubmit = async () => {
    const { username, email, password, role } = form;

    // Validate only Schema-required fields
    if (!username || !email || !password || !role) {
      setError(
        "Please fill in all required fields (Username, Email, Password, Role).",
      );
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // IMPORTANT: If your backend strictly requires encrypted data via `hybridDecryption`,
      // you will need to wrap `form` with your frontend encryption function here.
      // e.g., const payload = myHybridEncryption(form);

      const payload = await hybridEncrypt(form);
      console.log(form)

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/create_account`,
        payload,
        {
          withCredentials: true, // Includes cookies in the request
        },
      );

      toast.success(response?.data?.message);

      // FIXED LINE HERE: Passing 'form' state instead of response.data message
      if (onSubmit) onSubmit(form);
      onClose();
    } catch (err) {
      console.log(err);
      // Catch backend errors (e.g., duplicate email/username handling)
      const errorMsg =
        err.response?.data?.message ||
        "Internal server error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = form.password ? getPwStrength(form.password) : null;

  return (
    <div
      className="fixed md:absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-25 rounded-xl"
      onClick={(e) =>
        !isSubmitting && e.target === e.currentTarget && onClose()
      }
    >
      <div
        className={` ${commonComponentBG()} overflow-auto w-162.5 max-w-[95%] md:max-w-full max-h-[90vh] md:max-h-[80vh] flex flex-col shadow-2xl  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-(--color-border-tertiary) bg-gray-50/50 ">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-(--color-text-primary)">
            <IoPersonAddSharp size={16} className="text-[#1D9E75]" />
            Create New User
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="text-(--color-text-secondary) hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-6">
          {error && (
            <div className="text-[12px] px-3 py-2 rounded-md bg-[#FCEBEB] text-[#A32D2D] border border-[#F5C6C6]">
              {error}
            </div>
          )}

          {/* --- PERSONAL --- */}
          <div>
            <div className="text-[11px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-3 border-b border-(--color-border-tertiary) pb-1">
              Personal Details
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <FieldLabel>First name</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Last name</FieldLabel>
                <input
                  className={commonInputField}
                  value={form?.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Display name</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <FieldLabel>Gender</FieldLabel>
                <select
                  className={commonInputField + " capitalize"}
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">—</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <input
                  type="date"
                  className={commonInputField}
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 555…"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* --- ADDRESS --- */}
          <div>
            <div className="text-[11px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-3 border-b border-(--color-border-tertiary) pb-1">
              Address
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FieldLabel>Street</FieldLabel>
                <input
                  className={commonInputField}
                  value={form?.address.street}
                  onChange={(e) =>
                    setNested("address", "street", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>City</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.address.city}
                  onChange={(e) => setNested("address", "city", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>State/Province</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.address.state}
                  onChange={(e) =>
                    setNested("address", "state", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Postal Code</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.address.postalCode}
                  onChange={(e) =>
                    setNested("address", "postalCode", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.address.country}
                  onChange={(e) =>
                    setNested("address", "country", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* --- ACCOUNT & SECURITY --- */}
          <div>
            <div className="text-[11px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-3 border-b border-(--color-border-tertiary) pb-1">
              Account & Security
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Username</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel required>Email</FieldLabel>
                <input
                  className={commonInputField}
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="">
                <FieldLabel required>Password</FieldLabel>
                <div className="relative">
                  <input
                    className={commonInputField + " pr-12"}
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary) hover:text-gray-700 disabled:opacity-50"
                    aria-label="Toggle password"
                    disabled={isSubmitting}
                  >
                    {showPw ? <IoIosEyeOff /> : <FaEye />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-0.75 flex-1 bg-(--color-border-tertiary) rounded-full overflow-hidden">
                      <div
                        style={{ width: strength.w, background: strength.bg }}
                        className="h-full transition-all duration-300"
                      />
                    </div>
                    <span
                      className="text-[10px] font-medium min-w-11.25 text-right"
                      style={{ color: strength.bg }}
                    >
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <ManagerField
                editing={true}
                manager={form.manager}
                onChange={(key, value) => set(key, value)}
                onSelectManager={(id) => set("managerId", id)}
              />
            </div>
          </div>

          {/* --- EMPLOYMENT --- */}
          <div>
            <div className="text-[11px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-3 border-b border-(--color-border-tertiary) pb-1">
              Employment
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Role</FieldLabel>
                <select
                  className={commonInputField}
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Hire Date</FieldLabel>
                <input
                  type="date"
                  className={commonInputField}
                  value={form.hireDate}
                  onChange={(e) => set("hireDate", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Employment Type</FieldLabel>
                <select
                  className={commonInputField + " capitalize"}
                  value={form.employmentType}
                  onChange={(e) => set("employmentType", e.target.value)}
                  disabled={isSubmitting}
                >
                  {EMP_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  className={commonInputField + " capitalize"}
                  value={form.employmentStatus}
                  onChange={(e) => set("employmentStatus", e.target.value)}
                  disabled={isSubmitting}
                >
                  {EMP_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* --- EMERGENCY CONTACT --- */}
          <div>
            <div className="text-[11px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-3 border-b border-(--color-border-tertiary) pb-1">
              Emergency Contact
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <FieldLabel>Name</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.emergencyContact.name}
                  onChange={(e) =>
                    setNested("emergencyContact", "name", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Relationship</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.emergencyContact.relationship}
                  onChange={(e) =>
                    setNested(
                      "emergencyContact",
                      "relationship",
                      e.target.value,
                    )
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <input
                  className={commonInputField}
                  value={form.emergencyContact.phone}
                  onChange={(e) =>
                    setNested("emergencyContact", "phone", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t border-(--color-border-tertiary) bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 px-4 text-[12px] font-medium rounded-md border border-(--color-border-secondary) text-(--color-text-secondary) hover:bg-(--color-background-secondary) transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 h-8 px-4 text-[12px] font-medium rounded-md bg-[#1D9E75] text-white hover:bg-[#157a5a] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <IoPersonAddSharp size={13} />
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
