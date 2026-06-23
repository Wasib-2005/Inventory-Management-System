import { Helmet } from "react-helmet-async";
import { useGetName } from "../../Hooks/userGetAppName";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { commonInputField } from "../../Theme/commonInputField";
import { FiFilter } from "react-icons/fi";
import ProductsComponentsIndex from "../../Components/ProductsComponents/ProductsComponentsIndex";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";

const Products = () => {
  const pageName = `Products | ${useGetName}`;
  return (
    <div>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      <div className={`${commonComponentBG("r")} h-[87vh] p-5 `}>
        {/* Search filter */}
        <div className={` flex gap-3`}>
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search roles..."
              className={`${commonInputField} pl-10`}
            />
          </div>
          <button className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-[#1D9E75] text-white text-[12px] font-medium border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors shrink-0 whitespace-nowrap">
            <IoIosAddCircleOutline size={16} />
            Create New Product
          </button>
        </div>
        <ProductsComponentsIndex />
      </div>
    </div>
  );
};

export default Products;
