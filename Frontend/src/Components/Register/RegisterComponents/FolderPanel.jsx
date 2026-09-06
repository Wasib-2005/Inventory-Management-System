import ProductsSellFolder from "./OrderComponents/ProductsSellFolder";
import CreditDebtFolder from "./CreditDebtFolder";
import CatalogFolder from "./CatalogFolder";
import TaskFolder from "./TaskFolder";

const FolderPanel = ({
  activeFolder,
  activeSub,
  typeSegment,
  onTypeChange,
  sales,
}) => {
  switch (activeFolder) {
    case "products-sell":
      return (
        <ProductsSellFolder
          activeSub={activeSub}
          sales={sales}
          typeFilter={typeSegment}
          onTypeFilterChange={onTypeChange}
        />
      );
    case "credit-debt":
      return <CreditDebtFolder activeType={activeSub} />;
    case "catalog":
      return <CatalogFolder activeSub={activeSub} />;
    case "task":
      return <TaskFolder activeSub={activeSub} />;
    default:
      return null;
  }
};

export default FolderPanel;
