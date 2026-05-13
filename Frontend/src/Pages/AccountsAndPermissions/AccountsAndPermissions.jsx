import { useState } from "react";
import AccountsFilterForm from "../../Components/AccountsAndPermissions/AccountsFilterForm";
import AccountsList from "../../Components/AccountsAndPermissions/AccountsList";

const AccountsAndPermissions = () => {
  const [accountsData, setAccountsData] = useState([]);
  
  // 1. Move the filter state here so the List can see it
  const [activeFilters, setActiveFilters] = useState({
    username: "",
    email: "",
    phone: "",
    role: "all",
    sortBy: "name-asc",
  });

  // 2. This function will be called when the user clicks "Apply Filter"
  const handleApplyFilters = (newFilters) => {
    // Setting this triggers the useEffect inside AccountsList to fetch new data
    setActiveFilters(newFilters);
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex mb-4">
        <h1 className="font-bold text-2xl md:text-3xl border-b-4 border-black border-dashed pb-1">
          Accounts & Permissions
        </h1>
      </div>

      <div className="md:flex gap-4 items-start">
        {/* Pass the handleApplyFilters function to the form */}
        <AccountsFilterForm onApply={handleApplyFilters} />

        {/* Pass the activeFilters to the list so it knows what to fetch */}
        <AccountsList
          accountsData={accountsData}
          setAccountsData={setAccountsData}
          filters={activeFilters}
        />
      </div>
    </div>
  );
};

export default AccountsAndPermissions;