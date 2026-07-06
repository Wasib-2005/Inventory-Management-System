import { useContext, useState } from "react";
import ProductsListContainer from "./ProductsContainer/ProductsListContainer";
import ProductsToolbarIndex from "./ProductsToolbar/ProductsToolbarIndex";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProductsCreateEditModel from "./ProductsModels/ProductsCreateEditModel";
import ProductDetailsModel from "./ProductsModels/ProductDetailsModel";

const ProductsComponentsIndex = () => {
  const { user } = useContext(UserContext);

  const [viewProduct, setViewProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [createEditProduct, setCreateEditProduct] = useState(null);
  const [isProductsCreateEditModel, setIsProductsCreateEditModel] = useState(false);

  const canEditProduct = !!user?.permissions?.hasProductChangePermission;

  const handleDeleteProduct = (productId) => {
    console.log("delete product", productId);
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
      <ProductsToolbarIndex openCreateProductModel={openCreateModal} />
      <ProductsListContainer
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
      />
    </div>
  );
};

export default ProductsComponentsIndex;