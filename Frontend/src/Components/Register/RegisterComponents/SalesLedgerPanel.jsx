import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { SALE_STATUS_STYLES } from "./constants";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const SalesLedgerPanel = ({ sales }) => (
  <div className={`${commonComponentBG()} overflow-hidden`}>
    <div className="p-5 border-b border-emerald-300/40">
      <h2 className="font-bold text-emerald-900 text-lg">Recent Sales</h2>
      <p className="text-xs text-emerald-700/50 mt-0.5">
        Today's receipts, at a glance
      </p>
    </div>

    {/* Desktop table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-emerald-50/60 text-emerald-700/60 uppercase text-xs font-bold tracking-wider border-b border-emerald-300/40">
          <tr>
            <th className="p-4 pl-6">Customer Details</th>
            <th className="p-4">Receipt & Mode</th>
            <th className="p-4 text-right">Discount</th>
            <th className="p-4 text-right">Net Price</th>
            <th className="p-4 pr-6 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-300/20">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-emerald-50/40 transition-colors">
              <td className="p-4 pl-6">
                <span className="block font-semibold text-emerald-900">
                  {sale.username}
                </span>
                <span className="text-xs text-emerald-700/50 block mt-0.5">
                  {sale.mobile}
                </span>
              </td>
              <td className="p-4">
                <span className="block font-mono text-xs text-emerald-700/60">
                  {sale.receipt}
                </span>
                <span className="text-[10px] font-bold text-emerald-700/40 uppercase tracking-wide block mt-0.5">
                  {sale.type}
                </span>
              </td>
              <td className="p-4 text-right text-rose-500 font-medium">
                {sale.discount > 0 ? `-${currency}${sale.discount}` : "—"}
              </td>
              <td className="p-4 text-right font-bold text-emerald-900">
                {currency}
                {sale.boughtPrice.toLocaleString()}
              </td>
              <td className="p-4 pr-6 text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${SALE_STATUS_STYLES[sale.status] || SALE_STATUS_STYLES.Partial}`}
                >
                  {sale.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile cards */}
    <div className="md:hidden divide-y divide-emerald-300/20">
      {sales.map((sale) => (
        <div key={sale.id} className="p-4 flex flex-col gap-1.5">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-emerald-900 text-sm">{sale.username}</p>
              <p className="text-xs text-emerald-700/50">{sale.mobile}</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0 ${SALE_STATUS_STYLES[sale.status] || SALE_STATUS_STYLES.Partial}`}
            >
              {sale.status}
            </span>
          </div>
          <div className="flex justify-between items-end text-xs mt-1">
            <div>
              <span className="block font-mono text-emerald-700/60">{sale.receipt}</span>
              <span className="text-[10px] font-bold text-emerald-700/40 uppercase tracking-wide">
                {sale.type}
              </span>
            </div>
            <div className="text-right">
              {sale.discount > 0 && (
                <span className="block text-rose-500 font-medium">
                  -{currency}
                  {sale.discount}
                </span>
              )}
              <span className="font-bold text-emerald-900">
                {currency}
                {sale.boughtPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SalesLedgerPanel;
