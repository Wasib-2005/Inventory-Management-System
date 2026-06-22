import EditField from "./Fields/EditField";
import Toggle from "./Toggle";
import StatusBadge from "./StatusBadge";
import UserAvatar from "./UserAvatar";
import ManagerField from "./Fields/ManagerField";

const SectionTitle = ({ children }) => (
  <div className="text-[13px] font-bold text-(--color-text-tertiary) uppercase tracking-widest mt-4 mb-2 pb-1 first:mt-0">
    <div className="flex ">
      <p className="border-b-3 border-dotted border-(--color-border-tertiary) px-1 text-gray-800">
        {children}
      </p>
    </div>
  </div>
);

const FlagRow = ({ label, desc, value, editing, onChange }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-(--color-border-tertiary) last:border-b-0">
    <div>
      <div className="text-[13px]">{label}</div>
      {desc && (
        <div className="text-[11px] text-(--color-text-tertiary)">{desc}</div>
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

const PermissionRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-(--color-border-tertiary) last:border-b-0 ml-10">
    <div className="text-[13px]">{label}</div>
    <StatusBadge
      status={value ? "Yes" : "No"}
      variant={value ? "role" : "danger"}
    />
  </div>
);

// Read-only field for non-editable values like manager
export const ReadonlyField = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 py-2 border-b border-(--color-border-tertiary) last:border-b-0">
    <span className="text-[11px] font-medium text-(--color-text-tertiary) uppercase tracking-wide">
      {label}
    </span>
    <span
      className={`text-[13px] ${!value ? "text-(--color-text-tertiary)" : "text-(--color-text-primary)"}`}
    >
      {value || "—"}
    </span>
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
    <SectionTitle>Personal Information</SectionTitle>
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
      {editing && (
        <EditField
          label="Photo Url"
          fieldKey="photoUrl"
          value={user.photoUrl}
          editing={editing}
          onChange={onChange}
        />
      )}
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
        fieldKey="dateOfBirth"
        value={user.dateOfBirth}
        editing={editing}
        onChange={onChange}
        type="date"
      />
      <EditField
        label="Gender"
        fieldKey="gender"
        value={user.gender}
        editing={editing}
        onChange={onChange}
      />
      <EditField
        label="Language"
        fieldKey="language"
        value={user.language}
        editing={editing}
        onChange={onChange}
      />
    </div>
    <EditField
      label="Display name"
      fieldKey="displayName"
      value={user.displayName}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Timezone"
      fieldKey="timezone"
      value={user.timezone}
      editing={editing}
      onChange={onChange}
    />

    <SectionTitle>Employment</SectionTitle>
    <EditField
      label="Role"
      fieldKey="roleTitle"
      value={user.roleTitle}
      editing={editing}
      onChange={onChange}
      required={true}
    />
    <EditField
      label="Employment type"
      fieldKey="employmentType"
      value={user.employmentType}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Employment status"
      fieldKey="employmentStatus"
      value={user.employmentStatus}
      editing={editing}
      onChange={onChange}
    />
    {/* Manager is always read-only — it's a populated object, not a plain string */}
    <ManagerField
      label="Manager"
      manager={user?.manager}
      editing={editing}
      onChange={onChange}
    />
    <ReadonlyField label="Employee ID" value={user.employeeId} />
    <ReadonlyField label="Hire date" value={user.hireDate} />
    <ReadonlyField
      label="Created at"
      value={user.createdAt ? user.createdAt.slice(0, 10) : null}
    />
  </div>
);

export const AddressTab = ({ user, editing, onChange }) => (
  <div>
    <SectionTitle>Address</SectionTitle>
    <EditField
      label="Street"
      fieldKey="address.street"
      value={user.address?.street}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="City"
      fieldKey="address.city"
      value={user.address?.city}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="State"
      fieldKey="address.state"
      value={user.address?.state}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Postal code"
      fieldKey="address.postalCode"
      value={user.address?.postalCode}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Country"
      fieldKey="address.country"
      value={user.address?.country}
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
      fieldKey="emergencyContact.name"
      value={user.emergencyContact?.name}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Relationship"
      fieldKey="emergencyContact.relationship"
      value={user.emergencyContact?.relationship}
      editing={editing}
      onChange={onChange}
    />
    <EditField
      label="Phone"
      fieldKey="emergencyContact.phone"
      value={user.emergencyContact?.phone}
      editing={editing}
      onChange={onChange}
    />
  </div>
);

export const FlagsTab = ({ user, editing, onChange }) => (
  <div>
    <SectionTitle>Account flags</SectionTitle>
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
    <FlagRow
      label="Can change his data"
      desc="Permission for changeing data on his own"
      value={user.canEditOwnData}
      editing={editing}
      onChange={(v) => onChange("canEditOwnData", v)}
    />

    <SectionTitle>Permissions</SectionTitle>
    <p className="text-[14px] text-black font-bold">
      Product Related Permissions:
    </p>
    <PermissionRow
      label="Read products"
      value={user.permissions?.hasReadProductPermission}
    />
    <PermissionRow
      label="Add products"
      value={user.permissions?.hasAddProductPermission}
    />
    <PermissionRow
      label="Change products"
      value={user.permissions?.hasProductChangePermission}
    />
    <PermissionRow
      label="Delete products"
      value={user.permissions?.hasProductDeletePermission}
    />
    <p className="text-[14px] text-black font-bold">
      Role Related Permissions:
    </p>
    <PermissionRow
      label="Read roles"
      value={user.permissions?.hasReadRolePermission}
    />
    <PermissionRow
      label="Add roles"
      value={user.permissions?.hasNewRoleAddPermission}
    />
    <PermissionRow
      label="Change role "
      value={user.permissions?.hasRolePermissionsChangePermission}
    />
    <PermissionRow
      label="Delete roles"
      value={user.permissions?.hasNewRoleDeletePermission}
    />
    <p className="text-[14px] text-black font-bold">
      User Data Related Permissions:
    </p>
    <PermissionRow
      label="Read user data"
      value={user.permissions?.hasUserDataReadPermission}
    />
    <PermissionRow
      label="Add user data"
      value={user.permissions?.hasUserDataAddPermission}
    />
    <PermissionRow
      label="Change user data"
      value={user.permissions?.hasUserDataChangePermission}
    />
    <PermissionRow
      label="Delete user data"
      value={user.permissions?.hasUserDataDeletePermission}
    />
  </div>
);