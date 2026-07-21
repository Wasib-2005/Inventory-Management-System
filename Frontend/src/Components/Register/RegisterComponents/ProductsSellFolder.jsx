import ReturnsWarrantyPanel from "./ReturnSwarrantyPanel";
import SellPanel from "./SellPanel";

const ProductsSellFolder = ({ activeSub, sales }) => {
  if (activeSub === "returns") return <ReturnsWarrantyPanel />;
  return <SellPanel sales={sales} />;
};

export default ProductsSellFolder;