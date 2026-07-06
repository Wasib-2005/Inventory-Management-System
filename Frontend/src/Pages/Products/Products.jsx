import { Helmet } from "react-helmet-async";
import { useGetName } from "../../Hooks/userGetAppName";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import ProductsComponentsIndex from "../../Components/ProductsComponents/ProductsComponentsIndex";

const Products = () => {
  const appName = useGetName;
  const pageName = `Products | ${appName}`;

  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>

      <ProductsComponentsIndex />
    </div>
  );
};

export default Products;
