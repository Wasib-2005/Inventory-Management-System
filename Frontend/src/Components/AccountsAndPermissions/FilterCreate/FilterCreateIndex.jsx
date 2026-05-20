import { useState } from "react";
import AccountsCreateButton from "./AccountsCreate/AccountsCreateButton";
import AccountsCreateForm from "./AccountsCreate/AccountsCreateForm";
import AccountFilterButton from "./AccountsFilters/AccountFilterButton";
import AccountsFiltersForm from "./AccountsFilters/AccountsFiltersForm";

const FilterCreateIndex = () => {
  const [page, setPage] = useState("filter"); // "filter" or "createAccount"

  return (
    // The outer container hides horizontal overflow
    <div className="w-full overflow-hidden">
      {/* 
        The inner track is twice the width of the screen. 
        It shifts left by 100% when 'page' changes, creating a hardware-accelerated slide.
      */}
      <div
        className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
          page === "createAccount" ? "-translate-x-1/2" : "translate-x-0"
        }`}
      >
        {/* PAGE 1: FILTERS (Takes up exactly half of the 200% width) */}
        <div className="w-1/2 flex flex-col gap-3 px-1">
          <div
            onClick={() => setPage("createAccount")}
            className="cursor-pointer"
          >
            <AccountsCreateButton />
          </div>
          <AccountsFiltersForm page={page} />
        </div>

        {/* PAGE 2: CREATE ACCOUNT (Takes up the other half) */}
        <div className="w-1/2 flex flex-col gap-3 px-1">
          <AccountsCreateForm page={page} />
          <div onClick={() => setPage("filter")} className="cursor-pointer">
            <AccountFilterButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterCreateIndex;
