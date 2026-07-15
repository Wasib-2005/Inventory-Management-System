import { MdOutlineAttachMoney } from "react-icons/md";
import { IoCardOutline } from "react-icons/io5";
import ActionButton from "./ActionButton";
import CreditLedgerList from "./CreditLedgerList";

const CreditFolder = ({ ledger }) => (
  <div>
    <div className="mb-4">
      <h3 className="text-sm font-bold text-emerald-900">Credit & Debt Ledger</h3>
      <p className="text-xs text-emerald-700/50 mt-0.5">
        Settle client invoices and track outstanding debt limits
      </p>
    </div>

    <CreditLedgerList ledger={ledger} />

    <div className="grid grid-cols-2 gap-3">
      <ActionButton icon={MdOutlineAttachMoney} label="Collect Pay" color="rose" />
      <ActionButton icon={IoCardOutline} label="Adjust Limit" color="slate" />
    </div>
  </div>
);

export default CreditFolder;
