import { useState } from "react";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import NewAccountFormInnerElement from "./NewAccountFormInnerElement";
import useGetRole from "../../../Service/useGetRoles";

/* ── Static Options ─────────────────────────────────────────────── */
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
  { value: "consultant", label: "Consultant" },
];

const EMPLOYMENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "onboarding", label: "Onboarding" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
];

const INITIAL_FORM = {
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  photoUrl: "",
  dateOfBirth: "",
  gender: "",
  address: { street: "", city: "", state: "", postalCode: "", country: "" },
  department: "",
  jobTitle: "",
  employmentType: "full-time",
  employmentStatus: "onboarding",
  hireDate: "",
  manager: "",
  role: "",
  emergencyContact: { name: "", relationship: "", phone: "" },
};

/* ── Reusable Select Component ────────────────────────────────── */
const SelectField = ({ label, name, value, onChange, error, options, placeholder = "Select…" }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="text-xs font-bold uppercase tracking-widest text-gray-500">
      {label}
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`border-2 ${
          error ? "border-red-500" : "border-black"
        } px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all appearance-none cursor-pointer w-full`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value || opt._id} value={opt.value || opt._id}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
    </div>
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

/* ── Section Header ───────────────────────────────────────────── */
const Section = ({ title }) => (
  <h3 className="text-sm font-black uppercase tracking-wider border-b border-black pb-1 mb-3">
    {title}
  </h3>
);

/* ── Main Form Component ──────────────────────────────────────── */
const NewAccountForm = ({
  setNewUserFormModel,
  setNewUserData,
  departments = [],
  managers = [],
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { roles, loading: rolesLoading } = useGetRole();

  /* ── Validation ───────────────────────────────────────────── */
  const validate = () => {
    const errs = {};

    if (!formData.username.trim()) errs.username = "Username is required";
    else if (!/^[a-z0-9_]{3,20}$/.test(formData.username))
      errs.username = "3–20 chars: lowercase, numbers, underscores only";

    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Enter a valid email address";

    if (!formData.role) errs.role = "Role is required";

    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8)
      errs.password = "Must be at least 8 characters";

    if (!formData.confirmPassword) errs.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";

    if (formData.phone && !/^\+?[\d\s\-().]{7,20}$/.test(formData.phone))
      errs.phone = "Invalid phone number";

    if (formData.photoUrl && !/^https?:\/\/.+/.test(formData.photoUrl))
      errs.photoUrl = "Must be a valid URL";

    if (formData.hireDate && isNaN(new Date(formData.hireDate).getTime()))
      errs.hireDate = "Invalid date";

    if (
      formData.emergencyContact.phone &&
      !/^\+?[\d\s\-().]{7,20}$/.test(formData.emergencyContact.phone)
    )
      errs["emergencyContact.phone"] = "Invalid phone number";

    return errs;
  };

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNestedChange = (section, field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    const errKey = `${section}.${field}`;
    if (errors[errKey]) setErrors((prev) => ({ ...prev, [errKey]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        photoUrl: formData.photoUrl.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
          country: formData.address.country.trim(),
        },
        department: formData.department || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
        employmentType: formData.employmentType,
        employmentStatus: formData.employmentStatus,
        hireDate: formData.hireDate ? new Date(formData.hireDate) : undefined,
        manager: formData.manager || undefined,
        role: formData.role,
        password: formData.password,
        emergencyContact: {
          name: formData.emergencyContact.name.trim(),
          relationship: formData.emergencyContact.relationship.trim(),
          phone: formData.emergencyContact.phone.trim(),
        },
      };

      const hasAddress = Object.values(payload.address).some((v) => v);
      if (!hasAddress) delete payload.address;

      const hasEmergency = Object.values(payload.emergencyContact).some((v) => v);
      if (!hasEmergency) delete payload.emergencyContact;

      await new Promise((r) => setTimeout(r, 800));
      console.log("Creating user:", payload);

      setNewUserData?.(payload);
      setSubmitted(true);
      setTimeout(() => setNewUserFormModel(false), 1200);
    } catch (err) {
      setErrors({ form: err?.message || "Failed to create account. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setNewUserFormModel(false);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center"
    >
      <div className="bg-white/60 rounded-xl w-full max-w-2xl">
        <div
          className={`${commonComponentBG} max-h-[90vh] overflow-y-auto`}
          style={{ padding: 0, animation: "slideUp 0.2s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-gray-400 px-5 py-4 sticky top-0 bg-white z-10">
            <div>
              <h2 className="font-black text-lg uppercase tracking-tight">New Account</h2>
              <p className="text-xs text-gray-500 font-mono">Fill in the details below to create a user</p>
            </div>
            <button
              onClick={() => setNewUserFormModel(false)}
              className="w-8 h-8 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-colors font-bold text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-5 py-5 flex flex-col gap-6">
              {errors.form && (
                <div className="bg-red-50 border-2 border-red-500 px-3 py-2 text-sm text-red-600 font-medium">
                  {errors.form}
                </div>
              )}
              {submitted && (
                <div className="bg-green-50 border-2 border-green-600 px-3 py-2 text-sm text-green-700 font-bold text-center">
                  ✓ Account created successfully!
                </div>
              )}

              {/* ── Account ─────────────────────────── */}
              <div>
                <Section title="Account" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Username"
                      id="username"
                      name="username"
                      type="text"
                      placeholder="john_doe"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Email"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Password"
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Confirm Password"
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              {/* ── Profile ─────────────────────────── */}
              <div>
                <Section title="Profile" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="First Name"
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Last Name"
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Phone"
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Photo URL"
                      id="photoUrl"
                      name="photoUrl"
                      type="text"
                      placeholder="https://..."
                      value={formData.photoUrl}
                      onChange={handleChange}
                      error={errors.photoUrl}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="dateOfBirth" className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`border-2 ${
                          errors.dateOfBirth ? "border-red-500" : "border-black"
                        } px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all`}
                      />
                      {errors.dateOfBirth && (
                        <span className="text-xs text-red-500 font-medium">{errors.dateOfBirth}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <SelectField
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      error={errors.gender}
                      options={GENDERS}
                    />
                  </div>
                </div>
              </div>

              {/* ── Address ─────────────────────────── */}
              <div>
                <Section title="Address" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <NewAccountFormInnerElement
                      label="Street"
                      id="street"
                      name="street"
                      type="text"
                      placeholder="123 Main St"
                      value={formData.address.street}
                      onChange={handleNestedChange("address", "street")}
                      error={errors["address.street"]}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="City"
                      id="city"
                      name="city"
                      type="text"
                      placeholder="New York"
                      value={formData.address.city}
                      onChange={handleNestedChange("address", "city")}
                      error={errors["address.city"]}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="State"
                      id="state"
                      name="state"
                      type="text"
                      placeholder="NY"
                      value={formData.address.state}
                      onChange={handleNestedChange("address", "state")}
                      error={errors["address.state"]}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Postal Code"
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="10001"
                      value={formData.address.postalCode}
                      onChange={handleNestedChange("address", "postalCode")}
                      error={errors["address.postalCode"]}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Country"
                      id="country"
                      name="country"
                      type="text"
                      placeholder="USA"
                      value={formData.address.country}
                      onChange={handleNestedChange("address", "country")}
                      error={errors["address.country"]}
                    />
                  </div>
                </div>
              </div>

              {/* ── Employment ──────────────────────── */}
              <div>
                <Section title="Employment" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <SelectField
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      error={errors.department}
                      options={departments}
                      placeholder="Select department…"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Job Title"
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      placeholder="Software Engineer"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      error={errors.jobTitle}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <SelectField
                      label="Employment Type"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      error={errors.employmentType}
                      options={EMPLOYMENT_TYPES}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <SelectField
                      label="Employment Status"
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      error={errors.employmentStatus}
                      options={EMPLOYMENT_STATUSES}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="hireDate" className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Hire Date
                      </label>
                      <input
                        id="hireDate"
                        name="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={handleChange}
                        className={`border-2 ${
                          errors.hireDate ? "border-red-500" : "border-black"
                        } px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all`}
                      />
                      {errors.hireDate && (
                        <span className="text-xs text-red-500 font-medium">{errors.hireDate}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <SelectField
                      label="Manager"
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                      error={errors.manager}
                      options={managers}
                      placeholder="Select manager…"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <SelectField
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      error={errors.role}
                      options={(roles || []).map((r) => ({ value: r._id || r, label: r.name || r }))}
                      placeholder={rolesLoading ? "Loading roles…" : "Select a role…"}
                    />
                  </div>
                </div>
              </div>

              {/* ── Emergency Contact ───────────────── */}
              <div>
                <Section title="Emergency Contact" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Contact Name"
                      id="emergencyName"
                      name="emergencyName"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.emergencyContact.name}
                      onChange={handleNestedChange("emergencyContact", "name")}
                      error={errors["emergencyContact.name"]}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Relationship"
                      id="emergencyRelationship"
                      name="emergencyRelationship"
                      type="text"
                      placeholder="Spouse"
                      value={formData.emergencyContact.relationship}
                      onChange={handleNestedChange("emergencyContact", "relationship")}
                      error={errors["emergencyContact.relationship"]}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <NewAccountFormInnerElement
                      label="Contact Phone"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={formData.emergencyContact.phone}
                      onChange={handleNestedChange("emergencyContact", "phone")}
                      error={errors["emergencyContact.phone"]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t-2 border-dashed border-gray-400 px-5 py-4 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setNewUserFormModel(false)}
                className="flex-1 border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                style={{ borderColor: PALETTE.mint }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || submitted}
                className="flex-1 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2"
                style={{
                  backgroundColor: PALETTE.steel,
                  borderColor: PALETTE.steelDark,
                }}
              >
                {loading
                  ? "Creating…"
                  : submitted
                    ? "Done ✓"
                    : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NewAccountForm;