import { useContext, useMemo, useState } from "react";
import ProductsListContainer, {
  initialProductsData,
} from "./ProductsContainer/ProductsListContainer";
import ProductsToolbarIndex from "./ProductsToolbar/ProductsToolbarIndex";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProductsCreateEditModel from "./ProductsModels/ProductsCreateEditModel/ProductsCreateEditModel";
import ProductDetailsModel from "./ProductsModels/ProductDetailsModel";

const MOCK_WAREHOUSES = [
  { warehouseId: "wh-1", warehouseName: "Main Warehouse" },
  { warehouseId: "wh-2", warehouseName: "Secondary Storage" },
];

const ProductsComponentsIndex = () => {
  const { user } = useContext(UserContext);

  const [viewProduct, setViewProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [createEditProduct, setCreateEditProduct] = useState(null);
  const [isProductsCreateEditModel, setIsProductsCreateEditModel] =
    useState(false);

  // Lifted out of the list container so Create/Edit/Delete can actually
  // mutate it. Once the backend exists, this becomes state populated by
  // a fetch keyed on query.warehouseId instead of local mock data.
  const [productsData, setProductsData] = useState(initialProductsData);

  // Single source of truth for search/sort/filter/warehouse, fed by the toolbar.
  const [query, setQuery] = useState({
    warehouseId: "",
    search: "",
    sortBy: "Recently Added",
    filters: { category: "", stockStatus: "", variant: "" },
  });

  const canEditProduct = !!user?.permissions?.hasProductChangePermission;

  const categories = useMemo(
    () => [...new Set(productsData.map((p) => p.category).filter(Boolean))],
    [productsData],
  );

  const handleDeleteProduct = (productId) => {
    if (!productId) return;
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }
    setProductsData((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleSaveProduct = (formData) => {
    console.log(formData);
    setProductsData((prev) => {
      const isExisting =
        formData._id && prev.some((p) => p._id === formData._id);

      if (isExisting) {
        return prev.map((p) => (p._id === formData._id ? { ...formData } : p));
      }

      // TODO: the backend will assign the real _id on create; this is a
      return [...prev, { ...formData, _id: `local-${Date.now()}` }];
    });
  };

  const openCreateModal = () => {
    setCreateEditProduct(null);
    setIsProductsCreateEditModel(true);
  };

  const openEditModal = (productData) => {
    setCreateEditProduct(productData);
    setIsProductsCreateEditModel(true);
  };

  return (
    <div>
      <ProductsToolbarIndex
        openCreateProductModel={openCreateModal}
        warehouses={MOCK_WAREHOUSES}
        categories={categories}
        onQueryChange={setQuery}
      />
      <ProductsListContainer
        productsData={productsData}
        query={query}
        canEditProduct={canEditProduct}
        onSelectProduct={(productData) => setViewProduct(productData)}
        setIsDetailsOpen={setIsDetailsOpen}
        onEditProduct={openEditModal}
        onDeleteProduct={handleDeleteProduct}
      />

      <ProductDetailsModel
        isDetailsOpen={isDetailsOpen}
        setIsDetailsOpen={setIsDetailsOpen}
        productData={viewProduct}
        canEditProduct={canEditProduct}
        onEdit={openEditModal}
      />

      <ProductsCreateEditModel
        isProductsCreateEditModel={isProductsCreateEditModel}
        onClose={() => setIsProductsCreateEditModel(false)}
        editProduct={createEditProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductsComponentsIndex;
