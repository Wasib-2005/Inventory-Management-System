import EditField from "./EditField";
import Toggle from "./Toggle";
import StatusBadge from "./StatusBadge";
import UserAvatar from "./UserAvatar";

const SectionTitle = ({ children }) => (
  <div className="text-[11px] font-medium text-(--color-text-tertiary) uppercase tracking-widest mt-4 mb-2 pb-1 border-b border-(--color-border-tertiary) first:mt-0">
    {children}
  </div>
);

const FlagRow = ({ label, desc, value, editing, onChange }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-(--color-border-tertiary) last:border-b-0">
    <div>
      <div className="text-[13px]">{label}</div>
      {desc && (
        <div className="text-[11px] text-(--color-text-tertiary)">
          {desc}
        </div>
      )}
    </div>
    {editing ? (
      <Toggle value={value} onChange={onChange} />
    ) : (
      <StatusBadge
        status={value ? "Yes" : "No"}
        variant={value ? "role" : "danger"}
      />
    )}
  </div>
);

export const InfoTab = ({ user, editing, onChange }) => (
  <div>
    <SectionTitle>Identity</SectionTitle>
    <div className="flex items-center gap-2.5 py-2 pb-3">
      <UserAvatar user={user} size="lg" />
      <div>
        <div className="text-[15px] font-medium">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-[12px] text-(--color-text-tertiary)">
          {user.displayName}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-x-3">
      <EditField
        label="First name"
        fieldKey="firstName"
        value={user.firstName}
        editing={editing}
        onChange={onChange}
      />
      <EditField
        label="Last name"
        fieldKey="lastName"
        value={user.lastName}
        editing={editing}
        onChange={onChange}
      />
      <EditField
        label="Username"
        fieldKey="username"
        value={user.username}
        editing={editing}
        onChange={onChange}
      />
      <EditField
        label="Email"
        fieldKey="email"
        value={user.email}
        editing={editing}
        onChange={onChange}
        type="email"
      />
      <EditField
        label="Phone"
        fieldKey="phone"
        value={user.phone}
        editing={editing}
        onChange={onChange}
      />
      <EditField
        label="Date of birth"
        fieldKey="dob"
        value={user.dob}
        editing={editing}
        onChange={onChange}
        type="date"
      />
    </div>
    <EditField
      label="Display name"
      fieldKey="displayName"
      value={user.displayName}
      editing={editing}
      onChange={onChange}
    />

    <SectionTitle>Employment</SectionTitle>
    <EditField
      label="Role"
      fieldKey="role"
      value={user.role}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Employment type"
      fieldKey="empType"
      value={user.empType}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Employment status"
      fieldKey="empStatus"
      value={user.empStatus}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Manager"
      fieldKey="manager"
      value={user.manager}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Hire date"
      fieldKey="hireDate"
      value={user.hireDate}
      editing={false}
      onChange={onChange}
    />
  </div>
);

export const AddressTab = ({ user, editing, onChange }) => (
  <div>
    <SectionTitle>Address</SectionTitle>
    <EditField
      label="Street"
      fieldKey="street"
      value={user.street}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="City"
      fieldKey="city"
      value={user.city}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="State"
      fieldKey="state"
      value={user.state}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Postal code"
      fieldKey="postalCode"
      value={user.postalCode}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Country"
      fieldKey="country"
      value={user.country}
      editing={editing}
      onChange={onChange}
    />
  </div>
);

export const EmergencyTab = ({ user, editing, onChange }) => (
  <div>
    <SectionTitle>Emergency contact</SectionTitle>
    <EditField
      label="Name"
      fieldKey="emName"
      value={user.emName}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Relationship"
      fieldKey="emRel"
      value={user.emRel}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Phone"
      fieldKey="emPhone"
      value={user.emPhone}
      editing={editing}
      onChange={onChange}
    />
  </div>
);

export const FlagsTab = ({ user, editing, onChange }) => (
  <div>
    <SectionTitle>Flags</SectionTitle>
    <FlagRow
      label="Active"
      desc="User can log in"
      value={user.isActive}
      editing={editing}
      onChange={(v) => onChange("isActive", v)}
    />
    <FlagRow
      label="Verified"
      desc="Account is verified"
      value={user.isVerified}
      editing={editing}
      onChange={(v) => onChange("isVerified", v)}
    />
    <FlagRow
      label="Email verified"
      desc="Email address confirmed"
      value={user.emailVerified}
      editing={editing}
      onChange={(v) => onChange("emailVerified", v)}
    />
  </div>
);
