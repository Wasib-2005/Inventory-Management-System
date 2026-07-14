import { useContext, useEffect, useMemo, useState } from "react";
import ProductsListContainer from "./ProductsContainer/ProductsListContainer";
import ProductsToolbarIndex from "./ProductsToolbar/ProductsToolbarIndex";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProductsCreateEditModel from "./ProductsModels/ProductsCreateEditModel/ProductsCreateEditModel";
import ProductDetailsModel from "./ProductsModels/ProductDetailsModel";
import { getProduct } from "./ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/api";
import axios from "axios";

const ProductsComponentsIndex = () => {
  const { user } = useContext(UserContext);

  const [viewProduct, setViewProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [createEditProduct, setCreateEditProduct] = useState(null);
  const [isProductsCreateEditModel, setIsProductsCreateEditModel] =
    useState(false);
  const [isLoadingEditProduct, setIsLoadingEditProduct] = useState(false);

  const [productsData, setProductsData] = useState([]);

  const [query, setQuery] = useState({
    search: "",
    sortBy: "Recently Added",
    filters: { category: "", stockStatus: "", variant: "" },
  });

  const canEditProduct = !!user?.permissions?.hasProductChangePermission;

  const categories = useMemo(
    () => [
      ...new Set(
        productsData
          .map((p) => p.categoryData?.category || p.category)
          .filter(Boolean),
      ),
    ],
    [productsData],
  );

  const handleDeleteProduct = (productId) => {
    if (!productId) return;
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }
    setProductsData((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleSaveProduct = (savedProduct) => {
    setProductsData((prev) => {
      const isExisting =
        savedProduct._id && prev.some((p) => p._id === savedProduct._id);

      if (isExisting) {
        return prev.map((p) =>
          p._id === savedProduct._id ? { ...savedProduct } : p,
        );
      }

      return [...prev, savedProduct];
    });
    setIsProductsCreateEditModel(false);
  };

  const openCreateModal = () => {
    setCreateEditProduct(null);
    setIsProductsCreateEditModel(true);
  };

  const openEditModal = async (productData) => {
    setIsProductsCreateEditModel(true);
    setIsLoadingEditProduct(true);
    setCreateEditProduct(null);
    try {
      const res = await getProduct(productData._id);
      setCreateEditProduct(res.data?.data || productData);
    } catch (err) {
      console.error("Failed to load product for editing:", err);
      setCreateEditProduct(productData);
    } finally {
      setIsLoadingEditProduct(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/product/get`,
      );
      setProductsData(res.data.data);
    };
    getData();
  }, []);

  return (
    <div>
      <ProductsToolbarIndex
        openCreateProductModel={openCreateModal}
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
        isLoadingEditProduct={isLoadingEditProduct}
        onClose={() => setIsProductsCreateEditModel(false)}
        editProduct={createEditProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductsComponentsIndex;
