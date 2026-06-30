import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { MOCK_RACKS, RACK_ROWS, RACKS_PER_ROW } from "../Mockdata";
import WarehouseRackRow from "./WarehouseRackRow";

const WarehouseRackContainer = ({ onSelectRack }) => {
  const totalItems = Object.values(MOCK_RACKS).reduce(
    (a, r) => a + r.itemCount,
    0,
  );

  return (
    <div className={`${commonComponentBG()} p-4 sm:p-6 flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60">
          Rack System
        </h2>
        <div className="text-[11px] font-semibold text-emerald-700/50">
          <span>{totalItems} items stored</span>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="w-1/3 px-1 flex justify-between rounded-full bg-linear-to-r from-[#FF0000] via-[#FFFF00] to-[#50C878] text-sm">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {RACK_ROWS.map((row) => {
          const racksInRow = Array.from({ length: RACKS_PER_ROW }).map(
            (_, i) => MOCK_RACKS[`${row}${i + 1}`],
          );
          return (
            <WarehouseRackRow
              key={row}
              row={row}
              racks={racksInRow}
              onSelectRack={onSelectRack}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseRackContainer;
