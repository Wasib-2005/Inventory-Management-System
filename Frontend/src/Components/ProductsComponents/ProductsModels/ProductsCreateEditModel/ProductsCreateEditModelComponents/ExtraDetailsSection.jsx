import { FiPlus, FiArrowUp, FiArrowDown, FiTrash2 } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";

const ExtraDetailsSection = ({
  extraDetails,
  onAddSection,
  onSectionHeaderChange,
  onRemoveSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onFieldChange,
  onAddDetailField,
  onRemoveDetailField,
  onMoveFieldUp,
  onMoveFieldDown,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-emerald-50/50 border border-emerald-300/40">
      <div className="flex items-center justify-between mb-4 gap-2">
        <p className="text-emerald-800 font-semibold uppercase text-sm">
          Extra Details
        </p>
        <button
          type="button"
          onClick={onAddSection}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded transition-colors shrink-0"
        >
          <FiPlus size={12} /> Add Section
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {extraDetails.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="p-3 bg-white border border-emerald-200 rounded-md shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 border-b border-emerald-100 pb-2 sm:pb-1">
              <input
                type="text"
                placeholder="Section Header (e.g. Specifications)"
                value={section.header}
                onChange={(e) =>
                  onSectionHeaderChange(e.target.value, sectionIndex)
                }
                className="w-full sm:flex-1 p-1 text-sm font-semibold text-emerald-900 border-none focus:outline-none focus:ring-0 bg-transparent"
              />
              <div className="flex items-center justify-end gap-1 bg-emerald-50 p-1 rounded border border-emerald-100 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => onMoveSectionUp(sectionIndex)}
                  disabled={sectionIndex === 0}
                  className="text-emerald-500 hover:text-emerald-800 disabled:opacity-30 p-1"
                >
                  <FiArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveSectionDown(sectionIndex)}
                  disabled={sectionIndex === extraDetails.length - 1}
                  className="text-emerald-500 hover:text-emerald-800 disabled:opacity-30 p-1"
                >
                  <FiArrowDown size={14} />
                </button>
                <div className="w-px h-4 bg-emerald-200 mx-1" />
                <button
                  type="button"
                  onClick={() => onRemoveSection(sectionIndex)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {section.body?.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50/50 sm:bg-transparent p-2 sm:p-0 rounded border border-slate-100 sm:border-none"
                >
                  <div className="flex sm:flex-col gap-2 sm:gap-0.5 w-full sm:w-auto justify-between sm:justify-start border-b sm:border-none pb-1.5 sm:pb-0 mb-1 sm:mb-0">
                    <div className="flex gap-1 sm:gap-0.5">
                      <button
                        type="button"
                        onClick={() => onMoveFieldUp(sectionIndex, rowIndex)}
                        disabled={rowIndex === 0}
                        className="text-emerald-400 hover:text-emerald-700 disabled:opacity-30 p-0.5"
                      >
                        <FiArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveFieldDown(sectionIndex, rowIndex)}
                        disabled={rowIndex === section.body.length - 1}
                        className="text-emerald-400 hover:text-emerald-700 disabled:opacity-30 p-0.5"
                      >
                        <FiArrowDown size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveDetailField(sectionIndex, rowIndex)
                      }
                      className="text-red-400 hover:text-red-600 p-0.5 sm:hidden"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Label"
                    value={row.label}
                    onChange={(e) =>
                      onFieldChange(
                        e.target.value,
                        sectionIndex,
                        rowIndex,
                        "label",
                      )
                    }
                    className={commonInputField}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) =>
                      onFieldChange(
                        e.target.value,
                        sectionIndex,
                        rowIndex,
                        "value",
                      )
                    }
                    className={commonInputField}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveDetailField(sectionIndex, rowIndex)}
                    className="text-red-400 hover:text-red-600 p-1 hidden sm:block"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onAddDetailField(sectionIndex)}
                className="mt-2 w-fit flex items-center gap-1 text-[11px] text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
              >
                <FiPlus size={12} /> Add Field
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtraDetailsSection;
