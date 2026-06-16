import { FaHome } from "react-icons/fa";
import { FaCartFlatbedSuitcase, FaUsersGear } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";

const NavLinks = [
  { label: <FaHome size={18} />, path: "/", name: "Home" },
  {
    label: <FaCartFlatbedSuitcase size={22} />,
    path: "/products",
    name: "Products",
  },
  {
    label: <FaUsersGear size={22} />,
    path: "/role-management",
    name: "Role Control",
  },
  {
    label: <IoPersonSharp size={18} />,
    path: "/accounts-and-permissions",
    name: "Accounts & Permission",
  },
];

export default NavLinks