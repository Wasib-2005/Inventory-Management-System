import EditField from "../../AccountsAndPermissions/components/Fields/EditField";

const ProfileEmergency = ({ emergencyContact, editing, onChange }) => {
  if (!emergencyContact) return null;
  const { name, relationship, phone } = emergencyContact;

  const ecChange = (key, value) => onChange(`emergencyContact.${key}`, value);

  return (
    <div className="bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl border border-emerald-300/50 p-4 flex flex-col gap-1">
      <h3 className="font-bold uppercase tracking-widest text-emerald-700 text-xs border-b border-emerald-200/60 pb-2 mb-1">
        Emergency Contact
      </h3>
      <EditField label="Name"         fieldKey="name"         value={name}         editing={editing} onChange={ecChange} />
      <EditField label="Relationship" fieldKey="relationship" value={relationship} editing={editing} onChange={ecChange} />
      <EditField label="Phone"        fieldKey="phone"        value={phone}        editing={editing} onChange={ecChange} />
    </div>
  );
};

export default ProfileEmergency;