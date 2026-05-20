import { FaFilter } from "react-icons/fa";
import { PALETTE } from "../../../../Theme/palette";
import { primaryButton } from "../../../../Theme/primaryButton";
const AccountFilterButton = () => {
  return (
    <div>
      <button
        className={primaryButton + ""}
        style={{
          background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
        }}
      >
        <FaFilter /> Filter
      </button>
    </div>
  );
};

export default AccountFilterButton;
