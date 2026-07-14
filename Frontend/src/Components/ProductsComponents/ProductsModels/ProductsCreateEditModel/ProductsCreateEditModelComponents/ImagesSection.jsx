import { FiPlus, FiTrash2, FiImage, FiUpload, FiLink } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";
import { makeImageUrl } from "../../../../../Service/auth/makeImageUrl";

const ImagesSection = ({
  image,
  headerUploadMode,
  setHeaderUploadMode,
  extraUploadModes,
  isHeaderDragging,
  setIsHeaderDragging,
  draggingExtraIndex,
  setDraggingExtraIndex,
  onDragOver,
  onHeaderDrop,
  onExtraDrop,
  onHeaderFile,
  onExtraFile,
  onHeaderImageChange,
  onExtraImageChange,
  onAddExtraImageField,
  onRemoveExtraImageField,
  onToggleExtraMode,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-emerald-50/30 border border-emerald-200 flex flex-col gap-4">
      <div>
        <p className="text-emerald-800 font-semibold uppercase text-xs tracking-wider">
          Product Images Asset Manager
        </p>
        <p className="pl-7 text-sm text-orange-400">
          !Drag and Drop images or use a url for upload a photo
        </p>
      </div>

      <div
        onDragEnter={() => setIsHeaderDragging(true)}
        onDragOver={onDragOver}
        className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-3 rounded-md border transition-all duration-150 ${
          isHeaderDragging
            ? "border-emerald-500 bg-emerald-50 shadow-md"
            : "border-emerald-100"
        }`}
      >
        {isHeaderDragging && (
          <div
            onDragLeave={() => setIsHeaderDragging(false)}
            onDrop={onHeaderDrop}
            className="absolute inset-0 z-30 bg-emerald-600/10 border-2 border-dashed border-emerald-500 rounded-md backdrop-blur-[0.5px] flex items-center justify-center transition-all animate-pulse"
          >
            <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
              <FiUpload size={13} /> Drop to upload Main Display Image
            </span>
          </div>
        )}
        <div className="w-20 h-20 bg-slate-50 border border-emerald-100 rounded-md shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
          {image.header ? (
            <img
              src={makeImageUrl(image.header)}
              alt="Header Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <FiImage size={24} className="text-emerald-300" />
          )}
        </div>
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
              Main Display Image *
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded border text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setHeaderUploadMode("url")}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${headerUploadMode === "url" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500"}`}
              >
                <FiLink size={10} /> Link URL
              </button>
              <button
                type="button"
                onClick={() => setHeaderUploadMode("file")}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${headerUploadMode === "file" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500"}`}
              >
                <FiUpload size={10} /> Device File
              </button>
            </div>
          </div>
          {headerUploadMode === "url" ? (
            <input
              type="text"
              placeholder="Paste image link URL..."
              value={image.header}
              onChange={(e) => onHeaderImageChange(e.target.value)}
              className={commonInputField}
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={onHeaderFile}
              className={`${commonInputField} file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 text-xs text-slate-500 cursor-pointer border-dashed p-1.5`}
            />
          )}
        </div>
      </div>

      <div className="border-t border-emerald-100 pt-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            Additional Variant Images ({image.extra.length})
          </label>
          <button
            type="button"
            onClick={onAddExtraImageField}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
          >
            <FiPlus size={12} /> Add Extra Image
          </button>
        </div>
        {image.extra.map((url, index) => (
          <div
            key={index}
            onDragEnter={() => setDraggingExtraIndex(index)}
            onDragOver={onDragOver}
            className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-md border transition-all duration-150 ${
              draggingExtraIndex === index
                ? "border-emerald-500 bg-emerald-50/50"
                : "border-emerald-100"
            }`}
          >
            {draggingExtraIndex === index && (
              <div
                onDragLeave={() => setDraggingExtraIndex(null)}
                onDrop={(e) => onExtraDrop(index, e)}
                className="absolute inset-0 z-30 bg-emerald-600/10 border border-dashed border-emerald-500 rounded-md flex items-center justify-center"
              >
                <span className="bg-emerald-600 text-white font-semibold text-[10px] px-2 py-1 rounded-md shadow flex items-center gap-1">
                  <FiUpload size={11} /> Drop to attach variant {index + 1}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                {url ? (
                  <img
                    src={makeImageUrl(url)}
                    alt={`Extra ${index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiImage size={16} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                {extraUploadModes[index] === "url" ? (
                  <input
                    type="text"
                    placeholder="Paste image link URL or drag drop file anywhere directly over this item..."
                    value={url}
                    onChange={(e) => onExtraImageChange(index, e.target.value)}
                    className={commonInputField}
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onExtraFile(index, e)}
                    className={`${commonInputField} file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 text-[11px] text-slate-500 cursor-pointer border-dashed p-1`}
                  />
                )}
              </div>
            </div>
            <div className="flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0 pl-1 gap-1.5">
              <button
                type="button"
                onClick={() => onToggleExtraMode(index)}
                className="text-[10px] text-slate-500 font-medium bg-slate-100 border hover:bg-slate-200 px-2 py-0.5 rounded transition-all whitespace-nowrap"
              >
                {extraUploadModes[index] === "url"
                  ? "Use File Upload"
                  : "Use Link URL"}
              </button>
              <button
                type="button"
                onClick={() => onRemoveExtraImageField(index)}
                className="text-red-400 hover:text-red-600 p-1 self-end sm:self-auto"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagesSection;
