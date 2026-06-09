import { Helmet } from "react-helmet-async";

import { useGetName } from "../../Hooks/userGetAppName";
import FilterCreateIndex from "../../Components/AccountsAndPermissions/FilterCreateIndex";

const AccountsAndPermissions = () => {
  const pageName = `Accounts & Permissions | ${useGetName}`;
  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      <div >
        <div>
          <FilterCreateIndex />
        </div>
      </div>
    </div>
  );
};

export default AccountsAndPermissions;
