import { PALETTE } from "../../Theme/palette";
import { primaryButton } from "../../Theme/primaryButton";
import { IoPersonAddSharp } from "react-icons/io5";

const NewAccountFormButton = ({ setNewUserFormModel }) => {
  return (
    <div className="flex justify-center">
      <button
        style={{
          background: PALETTE.mint,
        }}
        onClick={() => setNewUserFormModel(true)}
        className={`${primaryButton} w-[90%]`}
      >
        <IoPersonAddSharp />
        <span>Add New User</span>
      </button>
    </div>
  );
};

export default NewAccountFormButton;
