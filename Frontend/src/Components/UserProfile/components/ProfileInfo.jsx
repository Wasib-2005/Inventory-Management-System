import EditField from "../../AccountsAndPermissions/components/Fields/EditField";

const ProfileInfo = ({ firstName, lastName, email, phone, gender, editing, onChange }) => {
  return (
    <div className="bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl border border-emerald-300/50 p-4 flex flex-col gap-1">
      <h3 className="font-bold uppercase tracking-widest text-emerald-700 text-xs border-b border-emerald-200/60 pb-2 mb-1">
        Personal Info
      </h3>
      <EditField label="First Name" fieldKey="firstName" value={firstName} editing={editing} onChange={onChange} />
      <EditField label="Last Name"  fieldKey="lastName"  value={lastName}  editing={editing} onChange={onChange} />
      <EditField label="Email"      fieldKey="email"      value={email}     editing={editing} onChange={onChange} type="email" />
      <EditField label="Phone"      fieldKey="phone"      value={phone}     editing={editing} onChange={onChange} />
      <EditField label="Gender"     fieldKey="gender"     value={gender}    editing={editing} onChange={onChange} />
    </div>
  );
};

export default ProfileInfo;