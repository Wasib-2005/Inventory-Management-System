import EditField from "../../AccountsAndPermissions/components/Fields/EditField";


const ProfileAddress = ({ address, editing, onChange }) => {
  if (!address) return null;
  const { street, city, state, postalCode, country } = address;

  // nested path helper — address fields go under "address.x"
  const addressChange = (key, value) => onChange(`address.${key}`, value);

  return (
    <div className="bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl border border-emerald-300/50 p-4 flex flex-col gap-1">
      <h3 className="font-bold uppercase tracking-widest text-emerald-700 text-xs border-b border-emerald-200/60 pb-2 mb-1">
        Address
      </h3>
      <EditField label="Street"      fieldKey="street"     value={street}     editing={editing} onChange={addressChange} />
      <div className="grid grid-cols-2 gap-x-3">
        <EditField label="City"       fieldKey="city"       value={city}       editing={editing} onChange={addressChange} />
        <EditField label="State"      fieldKey="state"      value={state}      editing={editing} onChange={addressChange} />
        <EditField label="Postal Code" fieldKey="postalCode" value={postalCode} editing={editing} onChange={addressChange} />
        <EditField label="Country"    fieldKey="country"    value={country}    editing={editing} onChange={addressChange} />
      </div>
    </div>
  );
};

export default ProfileAddress;