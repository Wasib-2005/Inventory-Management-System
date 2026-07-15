import { useContext, useEffect, useMemo, useState } from "react";
import ProductsListContainer from "./ProductsContainer/ProductsListContainer";
import ProductsToolbarIndex from "./ProductsToolbar/ProductsToolbarIndex";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProductsCreateEditModel from "./ProductsModels/ProductsCreateEditModel/ProductsCreateEditModel";
import ProductDetailsModel from "./ProductsModels/ProductDetailsModel";
import { getProduct } from "./ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/api";
import axios from "axios";
import Swal from "sweetalert2";

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

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/product/delete/${productId}`,
          { withCredentials: true },
        );

        const updatedProduct = response.data.data;

        setProductsData((prev) =>
          prev.map((p) => (p._id === productId ? updatedProduct : p)),
        );

        Swal.fire({
          title: "Deleted!",
          text: "The product has been marked as deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Something went wrong.",
          icon: "error",
        });
      }
    }
  };

  const handleRestoreProduct = async (productId) => {
    if (!productId) return;

    const result = await Swal.fire({
      title: "Restore Product?",
      text: "This will recover the product and mark it as active again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981", // emerald-500
      cancelButtonColor: "#64748b", // slate-500
      confirmButtonText: "Yes, restore it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Calling a PATCH endpoint to restore the deleted flag
        const response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/product/restore/${productId}`,
          {},
          { withCredentials: true },
        );

        const restoredProduct = response.data.data;

        // Update state with restored product payload
        setProductsData((prev) =>
          prev.map((p) => (p._id === productId ? restoredProduct : p)),
        );

        Swal.fire({
          title: "Restored!",
          text: "The product has been successfully recovered.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to restore product.",
          icon: "error",
        });
      }
    }
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
        onRestoreProduct={handleRestoreProduct}
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
