import { Helmet } from "react-helmet-async";
import { getName } from "../../Service/GetAppName";

const Home = () => {
      const pageName = `Home | ${getName}`;
    
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
