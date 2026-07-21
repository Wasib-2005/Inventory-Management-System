import ProductsSellFolder from "./ProductsSellFolder";
import CreditDebtFolder from "./CreditDebtFolder";
import CatalogFolder from "./CatalogFolder";
import TaskFolder from "./TaskFolder";

const FolderPanel = ({ activeFolder, activeSub, sales, creditLedger }) => {
  switch (activeFolder) {
    case "products-sell":
      return <ProductsSellFolder activeSub={activeSub} sales={sales} />;
    case "credit-debt":
      return <CreditDebtFolder activeSub={activeSub} ledger={creditLedger} />;
    case "catalog":
      return <CatalogFolder activeSub={activeSub} />;
    case "task":
      return <TaskFolder activeSub={activeSub} />;
    default:
      return null;
  }
};

export default FolderPanel;