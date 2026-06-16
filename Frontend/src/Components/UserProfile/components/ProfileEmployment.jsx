import EditField from "../../AccountsAndPermissions/components/Fields/EditField";

const ProfileEmployment = ({
  employmentType,
  employmentStatus,
  timezone,
  language,
//   editing,
//   onChange,
}) => {
    // this shouldn't be changed by user
  return (
    <div className="bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl border border-emerald-300/50 p-4 flex flex-col gap-1">
      <h3 className="font-bold uppercase tracking-widest text-emerald-700 text-xs border-b border-emerald-200/60 pb-2 mb-1">
        Employment
      </h3>

      <EditField
        label="Status"
        fieldKey="employmentStatus"
        value={employmentStatus}
        // editing={editing}
        // onChange={onChange}
      />
      <EditField
        label="Type"
        fieldKey="employmentType"
        value={employmentType}
        // editing={editing}
        // onChange={onChange}
      />
      <EditField
        label="Timezone"
        fieldKey="timezone"
        value={timezone}
        // editing={editing}
        // onChange={onChange}
      />
      <EditField
        label="Language"
        fieldKey="language"
        value={language}
        // editing={editing}
        // onChange={onChange}
      />
    </div>
  );
};

export default ProfileEmployment;
