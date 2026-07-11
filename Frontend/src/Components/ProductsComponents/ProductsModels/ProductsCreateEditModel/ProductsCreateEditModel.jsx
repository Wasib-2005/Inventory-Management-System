import { FiX, FiSave } from "react-icons/fi";
import { commonComponentBG } from "../../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../../Theme/secondaryButton";
import { primaryButton } from "../../../../Theme/primaryButton";

import { useProductForm } from "./ProductsCreateEditModelComponents/useProductForm";
import ImagesSection from "./ProductsCreateEditModelComponents/ImagesSection";
import BasicInfoSection from "./ProductsCreateEditModelComponents/BasicInfoSection";
import BarcodesSection from "./ProductsCreateEditModelComponents/BarcodesSection";
import VariantSection from "./ProductsCreateEditModelComponents/VariantSection";
import CategorySelector from "./ProductsCreateEditModelComponents/CategorySelector";
import SupplierSelector from "./ProductsCreateEditModelComponents/SupplierSelector";
import TagSelector from "./ProductsCreateEditModelComponents/TagSelector";
import CategoryAddModal from "./ProductsCreateEditModelComponents/CategoryAddModal";
import SupplierAddModal from "./ProductsCreateEditModelComponents/SupplierAddModal";
import UomSection from "./ProductsCreateEditModelComponents/UomSection";
import FlagsSection from "./ProductsCreateEditModelComponents/FlagsSection";
import PricingSection from "./ProductsCreateEditModelComponents/PricingSection";
import ComplianceSection from "./ProductsCreateEditModelComponents/ComplianceSection";
import SpecificationsSection from "./ProductsCreateEditModelComponents/SpecificationsSection";
import ExtraDetailsSection from "./ProductsCreateEditModelComponents/ExtraDetailsSection";

const ProductsCreateEditModel = ({
  isProductsCreateEditModel,
  onClose,
  editProduct,
  onSave,
}) => {
  const form = useProductForm({
    isOpen: isProductsCreateEditModel,
    editProduct,
    onSave,
  });

  if (!isProductsCreateEditModel) return null;

  const { formData, errors, isVariant } = form;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${commonComponentBG()} w-full max-w-2xl h-fit max-h-[85vh] flex flex-col rounded-2xl cursor-default`}
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
            <ImagesSection
              image={formData.image}
              headerUploadMode={form.headerUploadMode}
              setHeaderUploadMode={form.setHeaderUploadMode}
              extraUploadModes={form.extraUploadModes}
              isHeaderDragging={form.isHeaderDragging}
              setIsHeaderDragging={form.setIsHeaderDragging}
              draggingExtraIndex={form.draggingExtraIndex}
              setDraggingExtraIndex={form.setDraggingExtraIndex}
              onDragOver={form.handleDragOver}
              onHeaderDrop={form.handleHeaderDrop}
              onExtraDrop={form.handleExtraDrop}
              onHeaderFile={form.handleHeaderFile}
              onExtraFile={form.handleExtraFile}
              onHeaderImageChange={form.handleHeaderImageChange}
              onExtraImageChange={form.handleExtraImageChange}
              onAddExtraImageField={form.addExtraImageField}
              onRemoveExtraImageField={form.removeExtraImageField}
              onToggleExtraMode={form.toggleExtraMode}
            />

            <BasicInfoSection
              formData={formData}
              errors={errors}
              onChange={form.handleChange}
            />

            <BarcodesSection
              barcodes={formData.barcodes}
              scanningIndex={form.scanningBarcodeIndex}
              onAdd={form.addBarcode}
              onUpdate={form.updateBarcode}
              onRemove={form.removeBarcode}
              onScanStart={form.startBarcodeScan}
              onScanCancel={form.cancelBarcodeScan}
              onScanDetected={form.handleBarcodeDetected}
            />

            <VariantSection
              isVariant={isVariant}
              onToggleVariant={form.handleVariantToggle}
              parentProductId={formData.parentProductId}
              onParentProductIdChange={(v) =>
                form.setField("parentProductId", v)
              }
              parentProductIdError={errors.parentProductId}
              variantAttributes={formData.variantAttributes}
              onRemoveVariantAttr={form.removeVariantAttr}
              newVariantAttrKey={form.newVariantAttrKey}
              setNewVariantAttrKey={form.setNewVariantAttrKey}
              newVariantAttrValue={form.newVariantAttrValue}
              setNewVariantAttrValue={form.setNewVariantAttrValue}
              onAddVariantAttr={form.addVariantAttr}
            />

            <CategorySelector
              value={formData.categoryData}
              onChange={form.setCategoryData}
              onOpenAddModal={() => form.openAddModal("category")}
              error={errors.categoryData}
            />

            <SupplierSelector
              suppliers={formData.supplierData}
              onAdd={form.addSupplier}
              onRemove={form.removeSupplier}
              onOpenAddModal={() => form.openAddModal("supplier")}
            />

            <TagSelector
              tags={formData.tags}
              onAdd={form.addTag}
              onRemove={form.removeTag}
            />

            <UomSection
              uom={formData.uom}
              onUnitChange={(key, v) => form.setField(["uom", key], v)}
              onConversionFactorChange={(v) => {
                if (v === "" || (!isNaN(Number(v)) && Number(v) >= 0))
                  form.setField(["uom", "conversionFactor"], v);
              }}
            />

            <FlagsSection
              flags={formData.flags}
              onChange={(key, checked) =>
                form.setField(["flags", key], checked)
              }
            />

            <PricingSection
              pricing={formData.pricing}
              errors={errors}
              onPriceChange={form.handlePriceChange}
            />

            <ComplianceSection
              compliance={formData.compliance}
              onChange={form.handleChange}
            />

            <SpecificationsSection
              specifications={formData.specifications}
              onAdd={form.addSpecification}
              onUpdate={form.updateSpecification}
              onRemove={form.removeSpecification}
            />

            <ExtraDetailsSection
              extraDetails={formData.extraDetails}
              onAddSection={form.addSection}
              onSectionHeaderChange={form.handleSectionHeaderChange}
              onRemoveSection={form.removeSection}
              onMoveSectionUp={form.moveSectionUp}
              onMoveSectionDown={form.moveSectionDown}
              onFieldChange={form.handleFieldChange}
              onAddDetailField={form.addDetailField}
              onRemoveDetailField={form.removeDetailField}
              onMoveFieldUp={form.moveFieldUp}
              onMoveFieldDown={form.moveFieldDown}
            />
          </div>

          <div className="p-4 border-t border-emerald-300/40 bg-emerald-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={form.handleSubmit}
              className={`${primaryButton} bg-[#1D9E75] text-white flex items-center gap-1.5`}
            >
              <FiSave size={14} />
              Save Product
            </button>
          </div>
        </div>
      </div>

      {form.activeAddModal === "category" && (
        <CategoryAddModal
          onClose={form.closeAddModal}
          onCreated={form.handleCategoryCreated}
        />
      )}
      {form.activeAddModal === "supplier" && (
        <SupplierAddModal
          onClose={form.closeAddModal}
          onCreated={form.handleSupplierCreated}
        />
      )}
    </>
  );
};

export default ProductsCreateEditModel;
