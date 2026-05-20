import AccountsList from "../../Components/AccountsAndPermissions/AccountsList/AccountsList";
import FilterCreateIndex from "../../Components/AccountsAndPermissions/FilterCreate/FilterCreateIndex";

const AccountsAndPermissions = () => {
  return (
    <div className="md:flex gap-3">
      <div className="md:w-1/3">
        <FilterCreateIndex />
      </div>
      <div className="md:w-2/3">
        <AccountsList />
      </div>
    </div>
  );
};

export default AccountsAndPermissions;
