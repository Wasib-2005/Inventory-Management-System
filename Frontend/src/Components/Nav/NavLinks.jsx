import { FaCartFlatbedSuitcase, FaUsersGear } from "react-icons/fa6";
import { PiWarehouseBold } from "react-icons/pi";
import { IoPersonSharp } from "react-icons/io5";
import { MdSpaceDashboard } from "react-icons/md";
import { FaCashRegister } from "react-icons/fa";
const icon = 25;
const NavLinks = [
  {
    label: <MdSpaceDashboard size={icon} />,
    path: "/",
    name: "Dashboard Dashboard",
  },
  {
    label: <FaCashRegister size={icon} />,
    path: "/register/operations",
    name: "Register Register",
  },
  {
    label: <FaCartFlatbedSuitcase size={icon} />,
    path: "/products",
    name: "Products Products",
  },
  {
    label: <PiWarehouseBold size={icon} />,
    path: "/warehouse",
    name: `Warehouse Warehouse`,
  },
  {
    label: <FaUsersGear size={icon} />,
    path: "/role-management",
    name: "Role Control Role Control",
  },
  {
    label: <IoPersonSharp size={icon} />,
    path: "/accounts-and-permissions",
    name: "Accounts & Permission",
  },
];

export default NavLinks;
