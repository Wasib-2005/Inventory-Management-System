import ReturnsWarrantyPanel from "../ReturnSwarrantyPanel";
import SellPanel from "./SellPanel";

const ProductsSellFolder = ({ activeSub, sales, typeFilter, onTypeFilterChange }) => {
  if (activeSub === "returns") {
    return (
      <ReturnsWarrantyPanel
        typeFilter={typeFilter || "all"}
        onTypeFilterChange={onTypeFilterChange}
      />
    );
  }
  return <SellPanel sales={sales} />;
};

export default ProductsSellFolder;