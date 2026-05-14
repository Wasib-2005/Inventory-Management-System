import { useState } from "react";
import AccountsFilterForm from "../../Components/AccountsAndPermissions/AccountsFilterForm";
import AccountsList from "../../Components/AccountsAndPermissions/AccountsList";

const DEFAULT_FILTERS = { username: "", email: "", phone: "", role: "all", sortBy: "name-asc" };

const AccountsAndPermissions = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  return (
    <div className="p-2 md:p-4">
      <div className="flex mb-4">
        <h1 className="font-bold text-2xl md:text-3xl border-b-4 border-black border-dashed pb-1">
          Accounts & Permissions
        </h1>
      </div>
      <div className="md:flex gap-4 items-start">
        <AccountsFilterForm onApply={setFilters} />
        <AccountsList filters={filters} />
      </div>
    </div>
  );
};
export default AccountsAndPermissions;