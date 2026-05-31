import { IoPersonAddOutline, IoPersonAddSharp } from "react-icons/io5";
import { commonComponentBG } from "../../../../Theme/commonComponentBG";
import { PALETTE } from "../../../../Theme/palette";
import Field from "../../../Common/Field";
import Input from "../../../Common/Inputs/Input";
import { primaryButton } from "../../../../Theme/primaryButton";
import { useContext, useState } from "react";
import TimeZoneWarning from "../../../Common/TimeZoneWarning";
import { hybridEncrypt } from "../../../../Service/auth/auth";
import axios from "axios";
import { UserContext } from "../../../../Contexts/UserContexts/UserContext";
import {useGetTimeZone} from "../../../../Hooks/useGetTimeZone";

const AccountsCreateForm = ({ page }) => {
  const isVisible = page === "createAccount";

  const [missingFields, setMissingFields] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successfulSubmission, setSuccessfulSubmission] = useState(false); // for controlling input data after submission if successful
  const [errorMessage, setErrorMessage] = useState("");

  const user = useContext(UserContext)?.user || {};

  const timeZone  = useGetTimeZone

  const fieldsConfig = {
    username: "",
    email: "",
    phone: "",
    photoUrl: "",
    firstName: "",
    lastName: "",
    displayName: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    timezone: timeZone || "", // Use hook value safely here
    language: "",
    employmentType: "",
    employmentStatus: "",
    hireDate: new Date().toISOString(),
    manager: "",
    role: "",
    password: "",
    passwordChangedAt: new Date().toISOString(),
    isActive: true,
    isVerified: true,
    emailVerified: true,
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    isDeleted: false,
  };

  console.log("Current User Context:", user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setMissingFields(false);

    const formData = new FormData(e.target);
    const data = {};
    let hasMissing = false;

    // Validate empty fields
    for (const [key, value] of formData.entries()) {
      if (value === "") {
        e.target[key]?.classList.add("border-red-500");
        hasMissing = true;
      } else {
        e.target[key]?.classList.remove("border-red-500");
        if (value === "true") data[key] = true;
        else if (value === "false") data[key] = false;
        else data[key] = value;
      }
    }

    setMissingFields(hasMissing);
    if (hasMissing) return;

    if (data?.password?.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      const payload = await hybridEncrypt(data);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/create_account`,
        payload,
        { withCredentials: true },
      );

      e.target.reset();
      setSuccessfulSubmission(true);
      setSuccessMessage(
        response?.data?.message || "Account created successfully!",
      );
      setSuccessfulSubmission(false);
    } catch (error) {
      if (error.response) {
        console.error("Backend Error:", error.response.data);
        const backendError =
          error.response.data.message || "An error occurred.";
        setErrorMessage(backendError);
      } else if (error.request) {
        console.error("Network Error:", error.request);
        setErrorMessage("Network error. Please check your connection.");
      } else {
        console.error("Error setting up request:", error.message);
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  // Flattening configuration keys for structural dynamic input maps
  const fieldEntries = Object.entries(fieldsConfig).flatMap(([key, value]) => {
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
      onSubmit={handleSubmit}
      className={`
        ${commonComponentBG} 
        transition-all duration-500 ease-in-out overflow-hidden
        ${isVisible ? "h-[83vh] border p-3" : "h-0 border-none p-0"}
      `}
    >
      <h1 className="ml-1 flex items-center gap-1 font-bold">
        <IoPersonAddOutline size={16} />
        <span>Create User</span>
      </h1>
      <TimeZoneWarning />

      <div
        className="w-full h-full rounded-lg shadow p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ background: PALETTE.bg }}
      >
        {fieldEntries.map(([label, value]) => {
          const cleanLabel = label
            .replace(/\./g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();

          return (
            <div key={label} className="border-b pb-2 border-gray-100 text-sm">
              <Field label={cleanLabel} icon={""}>
                {/* Note: value={value} will act as defaultValue unless you implement an onChange tracking system */}
                <Input
                  label={label}
                  value={value}
                  showValue={true}
                  successfulSubmission={successfulSubmission}
                />
              </Field>
            </div>
          );
        })}
      </div>

      <div className="mt-2 min-h-[20px]">
        {missingFields && (
          <p className="text-red-500 text-sm font-medium">
            Please fill in all required fields.
          </p>
        )}

        {errorMessage && (
          <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="text-green-600 text-sm font-medium">{successMessage}</p>
        )}
      </div>

      <button
        type="submit"
        className={`${primaryButton} border border-dotted mt-2`}
        style={{
          boxShadow: "0 1px 3px rgba(31, 111, 95, 0.3)",
          letterSpacing: "0.01em",
        }}
      >
        <IoPersonAddSharp size={16} />
        Create Account
      </button>
    </form>
  );
};

export default AccountsCreateForm;
