import { RiAccountBox2Line } from "react-icons/ri";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";

const AccountsList = () => {
  return (
    <div className={`h-[89vh] p-3 ${commonComponentBG}`}>
      <h1 className="flex gap-2 items-center text-2xl font-bold">
        <RiAccountBox2Line size={29} />
        <span>Accounts</span>
      </h1>
      <div
        className="w-full h-full rounded-lg shadow"
        style={{ background: PALETTE.bg }}
      ></div>
    </div>
  );
};

export default AccountsList;
