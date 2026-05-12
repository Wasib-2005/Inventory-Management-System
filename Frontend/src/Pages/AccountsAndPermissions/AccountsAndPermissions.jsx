import { PALETTE } from "../../Service/palette";

const AccountsAndPermissions = () => {
  return (
    <div
      className="ml-2 md:mr-5  min-h-screen p-2 md:rounded-r-2xl"
      style={{
        backgroundColor: PALETTE.bg,
        borderRight: `1px solid ${PALETTE.steel}`,
        boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
        cursor: "pointer", // Indicates it's interactive
      }}
    >
      <div className="min-h-screen flex flex-col px-1 md:px-3 py-2 md:py-4 transition-all duration-300 ease-in-out overflow-hidden bg-gray-300/30 md:rounded-r-xl">
        <div className="flex">
          <h1 className=" font-bold text-2xl md:text-3xl border-b-4 border-black border-dashed  ">
            Accounts & Permissions
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AccountsAndPermissions;
