import { CiFilter } from "react-icons/ci";
import { commonComponentBG } from "../../../../Theme/commonComponentBG";
import { PALETTE } from "../../../../Theme/palette";
import Field from "../../../Common/Field";
import Input from "../../../Common/Input";
import { primaryButton } from "../../../../Theme/primaryButton";
import TimeZoneWarning from "../../../Common/TimeZoneWarning";

const AccountsFiltersForm = ({ page }) => {
  const isVisible = page === "filter";

  const fields = {
    username: "jdoe_tech",
    email: "johndoe@company.com",
    phone: "+15550198234",
    photoUrl: "https://assets.company.com/profiles/jdoe_tech.jpg",
    firstName: "John",
    lastName: "Doe",
    displayName: "John D.",
    dateOfBirth: "1992-05-15T00:00:00.000Z",
    gender: "male",
    address: {
      street: "123 Innovation Way, Suite 400",
      city: "Austin",
      state: "Texas",
      postalCode: "78701",
      country: "United States",
    },
    timezone: "America/Chicago",
    language: "en",
    employmentType: "full-time",
    employmentStatus: "active",
    hireDate: "2024-01-10T00:00:00.000Z",
    manager: "65cb3e4a1f8b4a229c8e4d12",
    role: "65cb3e1c1f8b4a229c8e4d10",
    password: "$2b$12$e0MYzXyZ8P23K1vRw9A7eO3pGvWvYxFzKmUpQg7rLmNoPqRsTuVwX",
    passwordChangedAt: "2024-01-10T09:15:00.000Z",
    isActive: true,
    isVerified: true,
    emailVerified: true,
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+15550198235",
    },
    isDeleted: false,
  };

  const fieldEntries = Object.entries(fields).flatMap(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.entries(value).map(([subKey, subValue]) => [
        `${key}.${subKey}`,
        subValue,
      ]);
    }
    return [[key, value]];
  });

  return (
    <form
      className={`
        ${commonComponentBG} 
        transition-all duration-500 ease-in-out overflow-hidden
        ${isVisible ? "h-[83vh] border p-3" : "h-0 border-none p-0"}
      `}
    >
      <h1 className="ml-1 flex items-center font-bold">
        <CiFilter size={18} />
        <span>Filters</span>
      </h1>
      <TimeZoneWarning />
      <div
        className="w-full h-full rounded-lg shadow p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ background: PALETTE.bg }}
      >
        {fieldEntries.map(([label, value]) => {
          // Format label from camelCase/dot.notation to spaced capitalized words
          const cleanLabel = label
            .replace(/\./g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();

          return (
            <div key={label} className="border-b pb-2 border-gray-100 text-sm">
              {/* Pass the dynamic clean text and the structural icon token */}
              <Field label={cleanLabel} icon={""}>
                <Input label={label} value={value} />
              </Field>
            </div>
          );
        })}
      </div>
      <button
        className={`${primaryButton} border border-dotted mt-4`}
        style={{
          // background: "linear-gradient(135deg, #2FA084, #1F6F5F)",
          boxShadow: "0 1px 3px rgba(31, 111, 95, 0.3)",
          letterSpacing: "0.01em",
        }}
      >
        <CiFilter size={16} />
        Apply Filters
      </button>
    </form>
  );
};

export default AccountsFiltersForm;
