// ProductsComponentsIndex.jsx
import { useContext, useState } from "react";
import ProductsListContainer from "./ProductsContainer/ProductsListContainer";
import ProductsToolbarIndex from "./ProductsToolbar/ProductsToolbarIndex";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProductsModel from "./ProductsModels/ProductsModel";

const ProductsComponentsIndex = () => {
  const { user } = useContext(UserContext);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const canEditProduct = !!user?.permissions?.hasProductChangePermission;

  return (
    <div>
      <ProductsToolbarIndex />
      <ProductsListContainer
        canEditProduct={canEditProduct}
        onSelectProduct={(productData) => setSelectedProduct(productData)}
      />

      {selectedProduct && (
        <ProductsModel
          productData={selectedProduct}
          canEditProduct={canEditProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsComponentsIndex;