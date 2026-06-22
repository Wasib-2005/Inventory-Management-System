import { Helmet } from "react-helmet-async";
import UserProfileIndex from "../../Components/UserProfile/UserProfileIndex";
import { useGetName } from "../../Hooks/userGetAppName";

const UserProfile = () => {
  const pageName = `Profile | ${useGetName}`;
  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      <UserProfileIndex />
    </div>
  );
};

export default UserProfile;
