import SellPanel from "./SellPanel";
import CargoMovementsPanel from "./CargoMovementsPanel";

const ProductsSellFolder = ({ activeSub, sales }) =>
  activeSub === "movements" ? <CargoMovementsPanel /> : <SellPanel sales={sales} />;

export default ProductsSellFolder;