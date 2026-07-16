import { useState } from "react";
import { useNavigate } from "react-router";
import { IoCreateOutline } from "react-icons/io5";
import ActionButton from "./ActionButton";
import ProductsCreateEditModel from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModel";

const AddProductLauncher = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    setIsOpen(false);
    navigate("/products");
  };

  return (
    <div className="grid grid-cols-1">
      <ActionButton
        icon={IoCreateOutline}
        label="Add Product"
        color="emerald"
        onClick={() => setIsOpen(true)}
      />
      <ProductsCreateEditModel
        isProductsCreateEditModel={isOpen}
        isLoadingEditProduct={false}
        editProduct={null}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default AddProductLauncher;
