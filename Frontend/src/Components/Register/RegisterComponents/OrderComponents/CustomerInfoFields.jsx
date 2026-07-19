import UserSearchPanel from "./UserSearchPanel";

const addressToString = (address) => {
  if (!address) return "";
  return [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const CustomerInfoFields = ({ customer, onChange }) => {
  const handleSelectUser = (user) => {
    onChange({
      accountId: user._id,
      username: user.displayName || user.username || "",
      email: user.email,
      mobile: user.phone || "",
      address: addressToString(user.address),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <UserSearchPanel onSelectUser={handleSelectUser} />

      {customer.accountId && (
        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
          <span>Linked to existing account</span>
          <button
            type="button"
            onClick={() => onChange({ accountId: null })}
            className="text-emerald-700/60 hover:text-rose-600 underline"
          >
            Unlink
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
            Customer
          </label>
          <input
            type="text"
            value={customer.username}
            onChange={(e) => onChange({ username: e.target.value })}
            placeholder="John Doe"
            className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
            Mobile
          </label>
          <input
            type="tel"
            value={customer.mobile}
            onChange={(e) => onChange({ mobile: e.target.value })}
            placeholder="+1 555-0199"
            className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>
        <div className="">
          <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
            Email
          </label>
          <input
            type="text"
            value={customer.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="user@email.com"
            className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>
        <div className="">
          <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
            Address
          </label>
          <input
            type="text"
            value={customer.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Street, City, Country"
            className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoFields;
