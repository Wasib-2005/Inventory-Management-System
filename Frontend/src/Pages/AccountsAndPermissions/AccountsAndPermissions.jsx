import AccountsFilterForm from "../../Components/AccountsAndPermissions/AccountsFilterForm";

const AccountsAndPermissions = () => {
  return (
    <div className="">
      <div className=" flex">
        <h1 className=" font-bold text-2xl md:text-3xl border-b-4 border-black border-dashed  ">
          Accounts & Permissions
        </h1>
      </div>
      <div className="md:flex gap-2">
        <AccountsFilterForm />
        // here i will add the result
      </div>
      <p>lorem*1000</p>
    </div>
  );
};

export default AccountsAndPermissions;
