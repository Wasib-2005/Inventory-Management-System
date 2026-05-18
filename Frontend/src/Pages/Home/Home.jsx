import { Helmet } from "react-helmet-async";
import { useGetName } from "../../Hooks/userGetAppName";
const Home = () => {
  const pageName = `Home | ${useGetName}`;

  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      home
    </div>
  );
};

export default Home;
