// ProductsComponentsIndex.jsx
import { useContext, useState } from "react";
import ProductsListContainer from "./ProductsContainer/ProductsListContainer";
import ProductsToolbarIndex from "./ProductsToolbar/ProductsToolbarIndex";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProductsModel from "./ProductsModels/ProductsCreateEditModel";
import ProductDetailsModel from "./ProductsModels/ProductDetailsModel";

const ProductsComponentsIndex = () => {
  const { user } = useContext(UserContext);

  // Product currently shown in the read-only details modal
  const [viewProduct, setViewProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Product currently open in the create/edit modal (kept separate from
  // viewProduct so opening details doesn't also pop open the edit form)
  const [editProduct, setEditProduct] = useState(null);

  const canEditProduct = !!user?.permissions?.hasProductChangePermission;

  const handleDeleteProduct = (productId) => {
    // TODO: wire to DELETE /api/products/:id once backend is ready
    console.log("delete product", productId);
  };

  return (
    <div>
      <ProductsToolbarIndex />
      <ProductsListContainer
        canEditProduct={canEditProduct}
        onSelectProduct={(productData) => setViewProduct(productData)}
        setIsDetailsOpen={setIsDetailsOpen}
        onEditProduct={(productData) => setEditProduct(productData)}
        onDeleteProduct={handleDeleteProduct}
      />

      <ProductDetailsModel
        isDetailsOpen={isDetailsOpen}
        setIsDetailsOpen={setIsDetailsOpen}
        productData={viewProduct}
        canEditProduct={canEditProduct}
        onEdit={(productData) => setEditProduct(productData)}
      />

      {editProduct && (
        <ProductsModel
          productData={editProduct}
          canEditProduct={canEditProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsComponentsIndex;