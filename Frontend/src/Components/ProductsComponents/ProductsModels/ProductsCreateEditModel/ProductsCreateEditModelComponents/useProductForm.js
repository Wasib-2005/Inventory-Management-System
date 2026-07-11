import { useState, useEffect } from "react";
import { emptyProduct } from "./constants";

export const useProductForm = ({ isOpen, editProduct, onSave }) => {
  const [formData, setFormData] = useState(emptyProduct);
  const [isVariant, setIsVariant] = useState(false);
  const [errors, setErrors] = useState({});

  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newSupplierInput, setNewSupplierInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [newVariantAttrKey, setNewVariantAttrKey] = useState("");
  const [newVariantAttrValue, setNewVariantAttrValue] = useState("");

  const [headerUploadMode, setHeaderUploadMode] = useState("url");
  const [extraUploadModes, setExtraUploadModes] = useState([]);

  const [isHeaderDragging, setIsHeaderDragging] = useState(false);
  const [draggingExtraIndex, setDraggingExtraIndex] = useState(null);

  const [scanningBarcodeIndex, setScanningBarcodeIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          ...emptyProduct,
          ...editProduct,
          image: {
            header: editProduct.image?.header || "",
            extra: editProduct.image?.extra || [],
          },
          flags: { ...emptyProduct.flags, ...editProduct.flags },
          uom: { ...emptyProduct.uom, ...editProduct.uom },
          pricing: { ...emptyProduct.pricing, ...editProduct.pricing },
          compliance: { ...emptyProduct.compliance, ...editProduct.compliance },
          barcodes: editProduct.barcodes || [],
          categoryIds: editProduct.categoryIds || [],
          supplierIds: editProduct.supplierIds || [],
          tags: editProduct.tags || [],
          specifications: editProduct.specifications || [],
          extraDetails: editProduct.extraDetails || [],
          variantAttributes: editProduct.variantAttributes || {},
          parentProductId: editProduct.parentProductId || null,
        });
        setIsVariant(!!editProduct.parentProductId);
        setExtraUploadModes(
          new Array(editProduct.image?.extra?.length || 0).fill("url"),
        );
      } else {
        setFormData(emptyProduct);
        setIsVariant(false);
        setExtraUploadModes([]);
      }
      setErrors({});
      setScanningBarcodeIndex(null);
    }
  }, [editProduct, isOpen]);

  const setField = (path, value) => {
    setFormData((prev) => {
      if (Array.isArray(path)) {
        const [parent, child] = path;
        return { ...prev, [parent]: { ...prev[parent], [child]: value } };
      }
      return { ...prev, [path]: value };
    });
  };

  const handleChange = (e, field, nestedField = null) => {
    const value = e.target.value;
    if (nestedField) setField([field, nestedField], value);
    else setField(field, value);
  };

  const handlePriceChange = (e, nestedField) => {
    const value = e.target.value;
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) return;

    setFormData((prev) => {
      const mrp = Number(prev.pricing.mrp) || 0;
      let updated = { ...prev.pricing, [nestedField]: value };

      if (nestedField === "sellPrice" && mrp > 0) {
        updated.sellPricePercentage = (
          100 -
          (Number(value) / mrp) * 100
        ).toFixed(2);
      }
      if (nestedField === "buyPrice" && mrp > 0) {
        updated.buyPricePercentage = (
          100 -
          (Number(value) / mrp) * 100
        ).toFixed(2);
      }
      if (nestedField === "sellPricePercentage" && mrp > 0) {
        updated.sellPrice = (mrp * ((100 - Number(value)) / 100)).toFixed(2);
      }
      if (nestedField === "buyPricePercentage" && mrp > 0) {
        updated.buyPrice = (mrp * ((100 - Number(value)) / 100)).toFixed(2);
      }
      if (nestedField === "mrp" && Number(value) > 0) {
        const sellPct = Number(prev.pricing.sellPricePercentage) || 0;
        const buyPct = Number(prev.pricing.buyPricePercentage) || 0;
        if (prev.pricing.sellPrice)
          updated.sellPrice = (Number(value) * ((100 - sellPct) / 100)).toFixed(
            2,
          );
        if (prev.pricing.buyPrice)
          updated.buyPrice = (Number(value) * ((100 - buyPct) / 100)).toFixed(
            2,
          );
      }

      return { ...prev, pricing: updated };
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

  const handleHeaderImageChange = (val) =>
    setFormData((prev) => ({ ...prev, image: { ...prev.image, header: val } }));

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

  const addBarcode = () => {
    setFormData((prev) => ({
      ...prev,
      barcodes: [...prev.barcodes, { code: "", type: "unit" }],
    }));
  };

  const updateBarcode = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...prev.barcodes];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, barcodes: updated };
    });
  };

  const removeBarcode = (index) => {
    setFormData((prev) => ({
      ...prev,
      barcodes: prev.barcodes.filter((_, i) => i !== index),
    }));
    setScanningBarcodeIndex((prev) => (prev === index ? null : prev));
  };

  const startBarcodeScan = (index) => setScanningBarcodeIndex(index);

  const cancelBarcodeScan = () => setScanningBarcodeIndex(null);

  const handleBarcodeDetected = (index, decodedText) => {
    updateBarcode(index, "code", decodedText);
    setScanningBarcodeIndex(null);
  };

  const addChip = (listName, value, setInput) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (prev[listName].includes(trimmed)) return prev;
      return { ...prev, [listName]: [...prev[listName], trimmed] };
    });
    setInput("");
  };

  const removeChip = (listName, value) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((v) => v !== value),
    }));
  };

  const addVariantAttr = () => {
    const key = newVariantAttrKey.trim();
    const value = newVariantAttrValue.trim();
    if (!key || !value) return;
    setFormData((prev) => ({
      ...prev,
      variantAttributes: { ...prev.variantAttributes, [key]: value },
    }));
    setNewVariantAttrKey("");
    setNewVariantAttrValue("");
  };

  const removeVariantAttr = (key) => {
    setFormData((prev) => {
      const updated = { ...prev.variantAttributes };
      delete updated[key];
      return { ...prev, variantAttributes: updated };
    });
  };

  const handleVariantToggle = (checked) => {
    setIsVariant(checked);
    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        parentProductId: null,
        variantAttributes: {},
      }));
    }
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specifications: updated };
    });
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
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

  const addDetailField = (sectionIndex) => {
    const updatedDetails = [...formData.extraDetails];
    updatedDetails[sectionIndex].body.push({ label: "", value: "" });
    setFormData({ ...formData, extraDetails: updatedDetails });
  };

  const removeDetailField = (sectionIndex, rowIndex) => {
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

  const validateRequired = () => {
    const errs = {};
    console.log(formData);
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.sku.trim()) errs.sku = "SKU is required";
    if (formData.categoryIds.length === 0)
      errs.categoryIds = "At least one category is required";
    if (formData.pricing.mrp === "" || Number(formData.pricing.mrp) <= 0)
      errs.mrp = "MRP is required";
    if (
      formData.pricing.sellPrice === "" ||
      Number(formData.pricing.sellPrice) < 0
    )
      errs.sellPrice = "Sell price is required";
    if (isVariant && !formData.parentProductId?.trim())
      errs.parentProductId = "Parent product ID is required for a variant";
    setErrors(errs);
    console.log(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateRequired()) return;
    const payload = {
      ...formData,
    };
    console.log(payload);
    onSave?.(payload);
  };

  return {
    formData,
    setField,
    errors,
    isVariant,

    newCategoryInput,
    setNewCategoryInput,
    newSupplierInput,
    setNewSupplierInput,
    newTagInput,
    setNewTagInput,
    newVariantAttrKey,
    setNewVariantAttrKey,
    newVariantAttrValue,
    setNewVariantAttrValue,

    headerUploadMode,
    setHeaderUploadMode,
    extraUploadModes,

    isHeaderDragging,
    setIsHeaderDragging,
    draggingExtraIndex,
    setDraggingExtraIndex,

    scanningBarcodeIndex,

    handleChange,
    handlePriceChange,
    handleDragOver,
    handleHeaderDrop,
    handleExtraDrop,
    handleHeaderFile,
    handleExtraFile,
    handleHeaderImageChange,
    handleExtraImageChange,
    addExtraImageField,
    removeExtraImageField,
    toggleExtraMode,

    addBarcode,
    updateBarcode,
    removeBarcode,
    startBarcodeScan,
    cancelBarcodeScan,
    handleBarcodeDetected,

    addChip,
    removeChip,

    addVariantAttr,
    removeVariantAttr,
    handleVariantToggle,

    addSpecification,
    updateSpecification,
    removeSpecification,

    handleSectionHeaderChange,
    handleFieldChange,
    addSection,
    addDetailField,
    removeDetailField,
    removeSection,
    moveFieldUp,
    moveFieldDown,
    moveSectionUp,
    moveSectionDown,

    handleSubmit,
  };
};
