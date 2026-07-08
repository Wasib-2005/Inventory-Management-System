import { useState, useEffect } from "react";
import {
  FiX,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiSave,
  FiImage,
  FiUpload,
  FiLink,
} from "react-icons/fi";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../Theme/secondaryButton";
import { primaryButton } from "../../../Theme/primaryButton";

const ProductsCreateEditModel = ({
  isProductsCreateEditModel,
  onClose,
  editProduct,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    displayId: "",
    barCode: "",
    variantOf: "",
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
    image: { header: "", extra: [] },
    store: [],
    price: {
      sellPrice: "",
      sellPricePercentage: "",
      buyPrice: "",
      buyPricePercentage: "",
      mrp: "",
    },
    extraDetails: [],
  });

  const [headerUploadMode, setHeaderUploadMode] = useState("url");
  const [extraUploadModes, setExtraUploadModes] = useState([]);

  const [isHeaderDragging, setIsHeaderDragging] = useState(false);
  const [draggingExtraIndex, setDraggingExtraIndex] = useState(null);

  useEffect(() => {
    if (isProductsCreateEditModel) {
      if (editProduct) {
        setFormData({
          ...editProduct,
          variantOf: editProduct.variantOf || "",
          barCode: editProduct.barCode || "",
          image: {
            header: editProduct.image?.header || "",
            extra: editProduct.image?.extra || [],
          },
          price: {
            sellPrice: editProduct.price?.sellPrice ?? "",
            sellPricePercentage: editProduct.price?.sellPricePercentage ?? "",
            buyPrice: editProduct.price?.buyPrice ?? "",
            buyPricePercentage: editProduct.price?.buyPricePercentage ?? "",
            mrp: editProduct.price?.mrp ?? "",
          },
          extraDetails: editProduct.extraDetails || [],
        });
        setExtraUploadModes(
          new Array(editProduct.image?.extra?.length || 0).fill("url"),
        );
      } else {
        setFormData({
          displayId: "",
          barCode: "",
          variantOf: "",
          name: "",
          sku: "",
          category: "",
          unit: "pcs",
          image: { header: "", extra: [] },
          store: [],
          price: {
            sellPrice: "",
            sellPricePercentage: "",
            buyPrice: "",
            buyPricePercentage: "",
            mrp: "",
          },
          extraDetails: [],
        });
        setExtraUploadModes([]);
      }
    }
  }, [editProduct, isProductsCreateEditModel]);

  if (!isProductsCreateEditModel) return null;

  const handleChange = (e, field, nestedField = null) => {
    const value = e.target.value;

    if (
      (nestedField?.toLowerCase().includes("percentage") &&
        Number(value) > 100) ||
      value.includes("-")
    )
      return;
    if (
      (field?.toLowerCase().includes("price") && isNaN(Number(value))) ||
      value.includes("-")
    ) {
      return;
    }

    if (field?.toLowerCase().includes("price")) {
      let sellPrice = formData?.price.sellPrice;
      let sellPricePercentage = formData?.price.sellPricePercentage;
      let buyPrice = formData?.price.buyPrice;
      let buyPricePercentage = formData?.price.buyPricePercentage;
      const mrp = formData?.price.mrp;

      if (nestedField === "sellPrice") {
        sellPricePercentage = 100 - (value / mrp) * 100;
        setFormData((prev) => {
          if (nestedField) {
            return {
              ...prev,
              [field]: {
                ...prev[field],
                sellPricePercentage,
                [nestedField]: value,
              },
            };
          }
          return { ...prev, [field]: value };
        });
        return;
      }
      if (nestedField === "sellPricePercentage") {
        sellPrice = mrp * ((100 - value) / 100);
        setFormData((prev) => {
          if (nestedField) {
            return {
              ...prev,
              [field]: {
                ...prev[field],
                sellPrice,
                [nestedField]: value,
              },
            };
          }
          return { ...prev, [field]: value };
        });
      }

      if (nestedField === "buyPrice") {
        buyPricePercentage = 100 - (value / mrp) * 100;
        setFormData((prev) => {
          if (nestedField) {
            return {
              ...prev,
              [field]: {
                ...prev[field],
                buyPricePercentage,
                [nestedField]: value,
              },
            };
          }
          return { ...prev, [field]: value };
        });
        return;
      }
      if (nestedField === "buyPricePercentage") {
        buyPrice = mrp * ((100 - value) / 100);
        setFormData((prev) => {
          if (nestedField) {
            return {
              ...prev,
              [field]: {
                ...prev[field],
                buyPrice,
                [nestedField]: value,
              },
            };
          }
          return { ...prev, [field]: value };
        });
      }

      if (nestedField === "mrp") {
        sellPrice = value * ((100 - sellPricePercentage) / 100);
        buyPrice = value * ((100 - buyPricePercentage) / 100);
        console.log(value, sellPrice, buyPrice, 100 - sellPricePercentage);
        setFormData((prev) => {
          if (nestedField) {
            return {
              ...prev,
              [field]: {
                ...prev[field],
                sellPrice,
                buyPrice,
                [nestedField]: value,
              },
            };
          }
          return { ...prev, [field]: value };
        });
      }
    }
    setFormData((prev) => {
      if (nestedField) {
        return {
          ...prev,
          [field]: { ...prev[field], [nestedField]: value },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleHeaderDrop = (e) => {
    e.preventDefault();
    setIsHeaderDragging(false);
    setHeaderUploadMode("file");

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: { ...prev.image, header: localUrl },
      }));
    }
  };

  const handleExtraDrop = (index, e) => {
    e.preventDefault();
    setDraggingExtraIndex(null);
    setExtraUploadModes((prev) => {
      const updated = [...prev];
      updated[index] = "file";
      return updated;
    });

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const updatedExtra = [...prev.image.extra];
        updatedExtra[index] = localUrl;
        return { ...prev, image: { ...prev.image, extra: updatedExtra } };
      });
    }
  };

  const handleHeaderFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: { ...prev.image, header: localUrl },
      }));
    }
  };

  const handleExtraFile = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const updatedExtra = [...prev.image.extra];
        updatedExtra[index] = localUrl;
        return { ...prev, image: { ...prev.image, extra: updatedExtra } };
      });
    }
  };

  const handleHeaderImageChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      image: { ...prev.image, header: val },
    }));
  };

  const handleExtraImageChange = (index, val) => {
    setFormData((prev) => {
      const updatedExtra = [...prev.image.extra];
      updatedExtra[index] = val;
      return { ...prev, image: { ...prev.image, extra: updatedExtra } };
    });
  };

  const addExtraImageField = () => {
    setFormData((prev) => ({
      ...prev,
      image: { ...prev.image, extra: [...prev.image.extra, ""] },
    }));
    setExtraUploadModes((prev) => [...prev, "url"]);
  };

  const removeExtraImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        extra: prev.image.extra.filter((_, i) => i !== index),
      },
    }));
    setExtraUploadModes((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleExtraMode = (index) => {
    setExtraUploadModes((prev) => {
      const updated = [...prev];
      updated[index] = updated[index] === "url" ? "file" : "url";
      return updated;
    });
  };

  const handleSectionHeaderChange = (text, sectionIndex) => {
    const updatedDetails = [...formData.extraDetails];
    updatedDetails[sectionIndex].header = text;
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const handleFieldChange = (text, sectionIndex, rowIndex, fieldKey) => {
    const updatedDetails = [...formData.extraDetails];
    updatedDetails[sectionIndex].body[rowIndex][fieldKey] = text;
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      extraDetails: [...formData.extraDetails, { header: "", body: [] }],
    });
  };

  const addField = (sectionIndex) => {
    const updatedDetails = [...formData.extraDetails];
    updatedDetails[sectionIndex].body.push({ label: "", value: "" });
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const removeField = (sectionIndex, rowIndex) => {
    const updatedDetails = [...formData.extraDetails];
    updatedDetails[sectionIndex].body.splice(rowIndex, 1);
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const removeSection = (sectionIndex) => {
    const updatedDetails = [...formData.extraDetails];
    updatedDetails.splice(sectionIndex, 1);
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const moveFieldUp = (sectionIndex, rowIndex) => {
    if (rowIndex === 0) return;
    const updatedDetails = [...formData.extraDetails];
    const body = updatedDetails[sectionIndex].body;
    [body[rowIndex - 1], body[rowIndex]] = [body[rowIndex], body[rowIndex - 1]];
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const moveFieldDown = (sectionIndex, rowIndex) => {
    const updatedDetails = [...formData.extraDetails];
    const body = updatedDetails[sectionIndex].body;
    if (rowIndex === body.length - 1) return;
    [body[rowIndex + 1], body[rowIndex]] = [body[rowIndex], body[rowIndex + 1]];
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const moveSectionUp = (sectionIndex) => {
    if (sectionIndex === 0) return;
    const updatedDetails = [...formData.extraDetails];
    [updatedDetails[sectionIndex - 1], updatedDetails[sectionIndex]] = [
      updatedDetails[sectionIndex],
      updatedDetails[sectionIndex - 1],
    ];
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const moveSectionDown = (sectionIndex) => {
    if (sectionIndex === formData.extraDetails.length - 1) return;
    const updatedDetails = [...formData.extraDetails];
    [updatedDetails[sectionIndex + 1], updatedDetails[sectionIndex]] = [
      updatedDetails[sectionIndex],
      updatedDetails[sectionIndex + 1],
    ];
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const handleSubmit = () => {
    onSave?.(formData);
    console.log(formData);
    return;
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full max-w-2xl h-fit max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-2xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/40 bg-emerald-50 rounded-t-2xl shrink-0">
          <h2 className="text-lg font-bold text-emerald-900">
            {editProduct ? "Edit Product" : "Create Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-white/80 hover:bg-white text-emerald-800 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-5">
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
              onDragOver={handleDragOver}
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-3 rounded-md border transition-all duration-150 ${
                isHeaderDragging
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : "border-emerald-100"
              }`}
            >
              {isHeaderDragging && (
                <div
                  onDragLeave={() => setIsHeaderDragging(false)}
                  onDrop={handleHeaderDrop}
                  className="absolute inset-0 z-30 bg-emerald-600/10 border-2 border-dashed border-emerald-500 rounded-md backdrop-blur-[0.5px] flex items-center justify-center transition-all animate-pulse"
                >
                  <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                    <FiUpload size={13} /> Drop to upload Main Display Image
                  </span>
                </div>
              )}

              <div className="w-20 h-20 bg-slate-50 border border-emerald-100 rounded-md shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                {formData.image.header ? (
                  <img
                    src={formData.image.header}
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
                    Main Display Image
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
                    placeholder="Paste stable image link URL or drop your file context over this block..."
                    value={formData.image.header}
                    onChange={(e) => handleHeaderImageChange(e.target.value)}
                    className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderFile}
                    className="file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 text-xs text-slate-500 cursor-pointer border border-dashed border-emerald-200 p-1.5 rounded-md w-full bg-white"
                  />
                )}
              </div>
            </div>

            <div className="border-t border-emerald-100 pt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                  Additional Variant Images ({formData.image.extra.length})
                </label>
                <button
                  type="button"
                  onClick={addExtraImageField}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
                >
                  <FiPlus size={12} /> Add Extra Image
                </button>
              </div>

              {formData.image.extra.map((url, index) => (
                <div
                  key={index}
                  onDragEnter={() => setDraggingExtraIndex(index)}
                  onDragOver={handleDragOver}
                  className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-md border transition-all duration-150 ${
                    draggingExtraIndex === index
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-emerald-100"
                  }`}
                >
                  {draggingExtraIndex === index && (
                    <div
                      onDragLeave={() => setDraggingExtraIndex(null)}
                      onDrop={(e) => handleExtraDrop(index, e)}
                      className="absolute inset-0 z-30 bg-emerald-600/10 border border-dashed border-emerald-500 rounded-md flex items-center justify-center"
                    >
                      <span className="bg-emerald-600 text-white font-semibold text-[10px] px-2 py-1 rounded-md shadow flex items-center gap-1">
                        <FiUpload size={11} /> Drop to attach variant{" "}
                        {index + 1}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                      {url ? (
                        <img
                          src={url}
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
                          onChange={(e) =>
                            handleExtraImageChange(index, e.target.value)
                          }
                          className="w-full p-1.5 text-xs border border-emerald-100 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleExtraFile(index, e)}
                          className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 text-[11px] text-slate-500 cursor-pointer border border-dashed border-slate-200 p-1 rounded w-full bg-white"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0 pl-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleExtraMode(index)}
                      className="text-[10px] text-slate-500 font-medium bg-slate-100 border hover:bg-slate-200 px-2 py-0.5 rounded transition-all whitespace-nowrap"
                    >
                      {extraUploadModes[index] === "url"
                        ? "Use File Upload"
                        : "Use Link URL"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExtraImageField(index)}
                      className="text-red-400 hover:text-red-600 p-1 self-end sm:self-auto"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange(e, "name")}
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange(e, "sku")}
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Barcode
              </label>
              <input
                type="text"
                value={formData.barCode}
                onChange={(e) => handleChange(e, "barCode")}
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Display ID
              </label>
              <input
                type="text"
                value={formData.displayId}
                onChange={(e) => handleChange(e, "displayId")}
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange(e, "category")}
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange(e, "unit")}
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Variant Of (Parent Product ID)
              </label>
              <input
                type="text"
                value={formData.variantOf || ""}
                onChange={(e) => handleChange(e, "variantOf")}
                placeholder="Leave blank if base product"
                className="p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full ">
            {/* SELL PRICE SECTION */}
            <div className="flex flex-col gap-1 md:w-[35%]">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Sell Price & %
              </label>
              <div className="flex gap-2">
                {/* Sell Price Amount */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    step="0.01"
                    value={formData.price.sellPrice}
                    onChange={(e) => handleChange(e, "price", "sellPrice")}
                    className="p-2 pr-7 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
                  />
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    {import.meta.env.VITE_CURRENCY_SYMBOL}
                  </span>
                </div>
                {/* Sell Price Percentage */}
                <div className="relative w-15">
                  <input
                    type="text"
                    step="0.01"
                    value={formData.price.sellPricePercentage}
                    onChange={(e) =>
                      handleChange(e, "price", "sellPricePercentage")
                    }
                    className="p-2 pr-6 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
                  />
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* BUY PRICE SECTION */}
            <div className="flex flex-col gap-1 md:w-[35%]">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Buy Price & %
              </label>
              <div className="flex gap-2">
                {/* Buy Price Amount */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    step="0.01"
                    value={formData.price.buyPrice}
                    onChange={(e) => handleChange(e, "price", "buyPrice")}
                    className="p-2 pr-7 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
                  />
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    {import.meta.env.VITE_CURRENCY_SYMBOL}
                  </span>
                </div>
                {/* Buy Price Percentage */}
                <div className="relative w-15">
                  <input
                    type="text"
                    step="0.01"
                    value={formData.price.buyPricePercentage}
                    onChange={(e) =>
                      handleChange(e, "price", "buyPricePercentage")
                    }
                    className="p-2 pr-6 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
                  />
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* MRP SECTION */}
            <div className="flex flex-col gap-1 md:w-[27%]">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                MRP
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  step="0.01"
                  value={formData.price.mrp}
                  onChange={(e) => handleChange(e, "price", "mrp")}
                  className="p-2 pr-7 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full"
                />
                <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  {import.meta.env.VITE_CURRENCY_SYMBOL}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-emerald-50/50 border border-emerald-300/40">
            <div className="flex items-center justify-between mb-4 gap-2">
              <p className="text-emerald-800 font-semibold uppercase text-sm">
                Extra Details
              </p>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded transition-colors shrink-0"
              >
                <FiPlus size={12} /> Add Section
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {formData.extraDetails.map((section, sectionIndex) => (
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
                        handleSectionHeaderChange(e.target.value, sectionIndex)
                      }
                      className="w-full sm:flex-1 p-1 text-sm font-semibold text-emerald-900 border-none focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-1 bg-emerald-50 p-1 rounded border border-emerald-100 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => moveSectionUp(sectionIndex)}
                        disabled={sectionIndex === 0}
                        className="text-emerald-500 hover:text-emerald-800 disabled:opacity-30 p-1"
                      >
                        <FiArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionDown(sectionIndex)}
                        disabled={
                          sectionIndex === formData.extraDetails.length - 1
                        }
                        className="text-emerald-500 hover:text-emerald-800 disabled:opacity-30 p-1"
                      >
                        <FiArrowDown size={14} />
                      </button>
                      <div className="w-px h-4 bg-emerald-200 mx-1" />
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
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
                              onClick={() =>
                                moveFieldUp(sectionIndex, rowIndex)
                              }
                              disabled={rowIndex === 0}
                              className="text-emerald-400 hover:text-emerald-700 disabled:opacity-30 p-0.5"
                            >
                              <FiArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                moveFieldDown(sectionIndex, rowIndex)
                              }
                              disabled={rowIndex === section.body.length - 1}
                              className="text-emerald-400 hover:text-emerald-700 disabled:opacity-30 p-0.5"
                            >
                              <FiArrowDown size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(sectionIndex, rowIndex)}
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
                            handleFieldChange(
                              e.target.value,
                              sectionIndex,
                              rowIndex,
                              "label",
                            )
                          }
                          className="w-full sm:w-1/3 p-1.5 text-[12px] border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={row.value}
                          onChange={(e) =>
                            handleFieldChange(
                              e.target.value,
                              sectionIndex,
                              rowIndex,
                              "value",
                            )
                          }
                          className="w-full sm:flex-1 p-1.5 text-[12px] border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeField(sectionIndex, rowIndex)}
                          className="text-red-400 hover:text-red-600 p-1 hidden sm:block"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(sectionIndex)}
                      className="mt-2 w-fit flex items-center gap-1 text-[11px] text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
                    >
                      <FiPlus size={12} /> Add Field
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-emerald-300/40 bg-emerald-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`${primaryButton} bg-[#1D9E75] text-white flex items-center gap-1.5`}
          >
            <FiSave size={14} />
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsCreateEditModel;
