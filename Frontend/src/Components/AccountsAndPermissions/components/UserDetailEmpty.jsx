import { IoPersonOutline } from "react-icons/io5";
import { commonComponentBG } from "../../../Theme/commonComponentBG";

const UserDetailEmpty = () => (
  <div className={`flex flex-col items-center justify-center h-full gap-2 text-(--color-text-tertiary) overflow-auto ${commonComponentBG("l")}`}>
    <IoPersonOutline size={36} className="opacity-30" />
    <p className="text-[13px]">Select a user to view details</p>
  </div>
);

export default UserDetailEmpty;
