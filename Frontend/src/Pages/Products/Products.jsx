import { Helmet } from "react-helmet-async";
import { useGetName } from "../../Hooks/userGetAppName";

const Products = () => {
  const pageName = `Products | ${useGetName}`;
  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
    </div>
  );
};

export default Products;
