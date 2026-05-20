import { PALETTE } from "../../../../Theme/palette";
import { primaryButton } from "../../../../Theme/primaryButton";
import { IoPersonAddSharp } from "react-icons/io5";

const AccountsCreateButton = () => {
  return (
    <div>
      <button
        className={primaryButton + ""}
        style={{
          background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
        }}
      >
        <IoPersonAddSharp />
        Create
      </button>
    </div>
  );
};

export default AccountsCreateButton;
