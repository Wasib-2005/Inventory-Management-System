import { useState } from "react";
import AccountsFilterForm from "../../Components/AccountsAndPermissions/AccountsFilterForm";
import AccountsList from "../../Components/AccountsAndPermissions/AccountsList";

const AccountsAndPermissions = () => {
  const [accountsData, setAccountsData] = useState([]);
  return (
    <div className="">
      <div className=" flex">
        <h1 className=" font-bold text-2xl md:text-3xl border-b-4 border-black border-dashed  ">
          Accounts & Permissions
        </h1>
      </div>
      <div className="md:flex gap-2">
        <AccountsFilterForm />
        <AccountsList
          accountsData={accountsData}
          setAccountsData={setAccountsData}
        />
      </div>
    </div>
  );
};

export default AccountsAndPermissions;
