import EditField from "../../AccountsAndPermissions/components/Fields/EditField";

const ProfileHeader = ({
  photoUrl,
  displayName = "", // Default value ensures string methods like .trim() won't crash the app
  username,
  employeeId,
  isActive,
  isVerified,
  editing,
  onChange,
  roleTitle,
}) => {
  console.log(photoUrl)
  // Safe extraction of initials (e.g., "John Doe" -> "JO")
  // Using a fallback "U" if displayName is empty or missing
  const avatarInitials =
    displayName && displayName.trim()
      ? displayName.trim().slice(0, 2).toUpperCase()
      : "U";

  return (
    <div className="bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl border border-emerald-300/50 p-4 flex items-center gap-4">
      {/* Avatar Section */}
      <div className="relative shrink-0">
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt={displayName}
              onError={(e) => {
                // Prevent infinite loop if /default-avatar.png also fails to load
                if (
                  e.target.src !==
                  window.location.origin + "/default-avatar.png"
                ) {
                  e.target.src = "/default-avatar.png";
                }
              }}
              className="w-26 h-26 rounded-full object-cover border-2 border-emerald-300/60 shadow-sm"
            />
          </>
        ) : (
          <div className="w-26 h-26 rounded-full bg-emerald-50 border-2 border-emerald-300/60 shadow-sm flex justify-center items-center select-none">
            <p className="text-3xl font-bold text-emerald-800">
              {avatarInitials}
            </p>
          </div>
        )}
        {isActive ? (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white " />
        ) : (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white " />
        )}
      </div>

      {/* Info Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <EditField
          label="Display Name"
          fieldKey="displayName"
          value={displayName}
          editing={editing}
          onChange={onChange}
        />
        <EditField
          label="Username"
          fieldKey="username"
          value={username}
          // editing={editing}
          // onChange={onChange}
        />
        <EditField label="Role" fieldKey="roleTitle" value={roleTitle} />

        <div className="flex flex-col gap-0.5 py-2">
          <span className="text-[10px] font-bold text-emerald-900/50 uppercase tracking-widest">
            Employee ID
          </span>
          <span className="text-sm font-medium text-emerald-900">
            #{employeeId}
          </span>
        </div>

        {editing && (
          <div className="col-span-1 sm:col-span-2">
            <EditField
              label="Photo URL"
              fieldKey="photoUrl"
              value={photoUrl}
              editing={editing}
              onChange={onChange}
            />
          </div>
        )}
      </div>

      {isVerified && (
        <span className="self-start shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-300/60 px-2 py-0.5 rounded-full">
          Verified
        </span>
      )}
    </div>
  );
};

export default ProfileHeader;
