import { commonFieldColour } from "../../Theme/commonFieldColour";

const Field = ({ icon: Icon, label, children }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={commonFieldColour.label}>{label}</label>
      <div className="relative flex items-center">
        <span className={commonFieldColour.icon}>
          <Icon size={12} />
        </span>
        {children}
      </div>
    </div>
  );
};

export default Field;
