import { useState, useEffect } from "react";
import { emptyProduct } from "./constants";
import { createProduct, updateProduct } from "./api";

export const useProductForm = ({ isOpen, editProduct, onSave }) => {
  const [formData, setFormData] = useState(emptyProduct);
  const [isVariant, setIsVariant] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Real File objects for any image the user picked from disk or dropped.
  // formData.image only ever holds strings (existing URLs or local blob:
  // previews) — the actual binary has to travel separately in FormData.
  const [headerImageFile, setHeaderImageFile] = useState(null);
  const [extraImageFiles, setExtraImageFiles] = useState([]);

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

  const [activeAddModal, setActiveAddModal] = useState(null);

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
          supplierData: editProduct.supplierData || [],
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
      setHeaderImageFile(null);
      setExtraImageFiles(
        new Array(editProduct?.image?.extra?.length || 0).fill(null),
      );
      setSaveError("");
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
      setHeaderImageFile(file);
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
      setExtraImageFiles((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
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
      setHeaderImageFile(file);
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
      setExtraImageFiles((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
      setFormData((prev) => {
        const updatedExtra = [...prev.image.extra];
        updatedExtra[index] = localUrl;
        return { ...prev, image: { ...prev.image, extra: updatedExtra } };
      });
    }
  };

  // Typing/pasting a URL means the person is no longer using the file they
  // may have previously picked, so clear it — otherwise a stale File would
  // silently keep overriding the typed URL on submit.
  const handleHeaderImageChange = (val) => {
    setHeaderImageFile(null);
    setFormData((prev) => ({ ...prev, image: { ...prev.image, header: val } }));
  };

  const handleExtraImageChange = (index, val) => {
    setExtraImageFiles((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
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
    setExtraImageFiles((prev) => [...prev, null]);
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
    setExtraImageFiles((prev) => prev.filter((_, i) => i !== index));
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

  const setCategoryData = (categoryData) => {
    setFormData((prev) => ({ ...prev, categoryData }));
  };

  const openAddModal = (type) => setActiveAddModal(type);
  const closeAddModal = () => setActiveAddModal(null);

  const handleCategoryCreated = (category) => {
    setFormData((prev) => ({
      ...prev,
      categoryData: {
        _id: category._id,
        category: category.category,
        subcategory: "",
      },
    }));
  };

  const addSupplier = (supplier) => {
    setFormData((prev) => {
      if (prev.supplierData.some((s) => s._id === supplier._id)) return prev;
      return { ...prev, supplierData: [...prev.supplierData, supplier] };
    });
  };

  const removeSupplier = (supplierId) => {
    setFormData((prev) => ({
      ...prev,
      supplierData: prev.supplierData.filter((s) => s._id !== supplierId),
    }));
  };

  const handleSupplierCreated = (supplier) => {
    addSupplier(supplier);
  };

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (prev.tags.includes(trimmed)) return prev;
      return { ...prev, tags: [...prev.tags, trimmed] };
    });
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
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
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.map((section, i) =>
        i === sectionIndex ? { ...section, header: text } : section,
      ),
    }));
  };

  const handleFieldChange = (text, sectionIndex, rowIndex, fieldKey) => {
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              body: section.body.map((row, j) =>
                j === rowIndex ? { ...row, [fieldKey]: text } : row,
              ),
            }
          : section,
      ),
    }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      extraDetails: [...prev.extraDetails, { header: "", body: [] }],
    }));
  };

  const addDetailField = (sectionIndex) => {
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.map((section, i) =>
        i === sectionIndex
          ? { ...section, body: [...section.body, { label: "", value: "" }] }
          : section,
      ),
    }));
  };

  const removeDetailField = (sectionIndex, rowIndex) => {
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              body: section.body.filter((_, j) => j !== rowIndex),
            }
          : section,
      ),
    }));
  };

  const removeSection = (sectionIndex) => {
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.filter((_, i) => i !== sectionIndex),
    }));
  };

  const moveFieldUp = (sectionIndex, rowIndex) => {
    if (rowIndex === 0) return;
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.map((section, i) => {
        if (i !== sectionIndex) return section;
        const body = [...section.body];
        [body[rowIndex - 1], body[rowIndex]] = [
          body[rowIndex],
          body[rowIndex - 1],
        ];
        return { ...section, body };
      }),
    }));
  };

  const moveFieldDown = (sectionIndex, rowIndex) => {
    setFormData((prev) => ({
      ...prev,
      extraDetails: prev.extraDetails.map((section, i) => {
        if (i !== sectionIndex) return section;
        if (rowIndex === section.body.length - 1) return section;
        const body = [...section.body];
        [body[rowIndex + 1], body[rowIndex]] = [
          body[rowIndex],
          body[rowIndex + 1],
        ];
        return { ...section, body };
      }),
    }));
  };

  const moveSectionUp = (sectionIndex) => {
    if (sectionIndex === 0) return;
    setFormData((prev) => {
      const updated = [...prev.extraDetails];
      [updated[sectionIndex - 1], updated[sectionIndex]] = [
        updated[sectionIndex],
        updated[sectionIndex - 1],
      ];
      return { ...prev, extraDetails: updated };
    });
  };

  const moveSectionDown = (sectionIndex) => {
    setFormData((prev) => {
      if (sectionIndex === prev.extraDetails.length - 1) return prev;
      const updated = [...prev.extraDetails];
      [updated[sectionIndex + 1], updated[sectionIndex]] = [
        updated[sectionIndex],
        updated[sectionIndex + 1],
      ];
      return { ...prev, extraDetails: updated };
    });
  };

  const validateRequired = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.sku.trim()) errs.sku = "SKU is required";
    if (!formData.categoryData?._id) errs.categoryData = "Category is required";
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
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateRequired()) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const payload = {
        ...formData,
        image: {
          header: headerImageFile ? "" : formData.image.header,
          extra: formData.image.extra.map((url, i) =>
            extraImageFiles[i] ? "" : url,
          ),
        },
      };

      console.log(11111,payload);

      const body = new FormData();
      body.append("data", JSON.stringify(payload));
      if (headerImageFile) body.append("headerImage", headerImageFile);
      extraImageFiles.forEach((file, i) => {
        if (file) body.append(`extraImage_${i}`, file);
      });

      const isEdit = !!editProduct?._id;
      const res = isEdit
        ? await updateProduct(editProduct._id, body)
        : await createProduct(body);

      if (res.data?.success) {
        onSave?.(res.data.data);
      } else {
        setSaveError(res.data?.message || "Could not save product");
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not save product");
    } finally {
      setIsSaving(false);
    }
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

    activeAddModal,
    openAddModal,
    closeAddModal,
    setCategoryData,
    handleCategoryCreated,
    addSupplier,
    removeSupplier,
    handleSupplierCreated,
    addTag,
    removeTag,

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
