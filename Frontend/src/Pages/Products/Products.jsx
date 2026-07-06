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
      <div
        className={`${commonComponentBG("r")} h-[87vh] p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-y-auto`}
      >
        <ProductsComponentsIndex />
      </div>
    </div>
  );
};

export default Products;
