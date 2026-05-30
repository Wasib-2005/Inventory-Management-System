import { Helmet } from "react-helmet-async";
import AccountsList from "../../Components/AccountsAndPermissions/AccountsList/AccountsList";

import { useGetName } from "../../Hooks/userGetAppName";
import FilterCreateIndex from "../../Components/AccountsAndPermissions/FilterAndCreateForm/FilterCreateIndex";

const AccountsAndPermissions = () => {
  const pageName = `Accounts & Permissions | ${useGetName}`;
  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      <div className="md:flex gap-3">
        <div className="md:w-1/3">
          <FilterCreateIndex />
        </div>
        <div className="md:w-2/3">
          <AccountsList />
        </div>
      </div>
    </div>
  );
};

export default AccountsAndPermissions;
