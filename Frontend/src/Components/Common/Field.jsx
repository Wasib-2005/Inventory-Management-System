import { commonFieldColour } from "../../Theme/commonFieldColour";

const Field = ({ label, children, icon: Icon = "" }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={commonFieldColour.label}>{label}</label>
      <div className="relative flex items-center">
        {Icon && <span className={commonFieldColour.icon}>{Icon}</span>}
        {children}
      </div>
    </div>
  );
};

export default Field;
