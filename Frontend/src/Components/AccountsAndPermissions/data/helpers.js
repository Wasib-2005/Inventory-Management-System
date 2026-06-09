import axios from "axios";

export const getInitials = (user) =>
  ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase();

export const STATUS_BADGE = {
  Active: "badge-success",
  "On leave": "badge-warning",
  Terminated: "badge-danger",
};

export const getRole = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles`,
  );

  return response.data
};


export const EMP_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Intern",
  "Contractor",
  "Consultant",
];
export const EMP_STATUS_OPTIONS = ["Active", "On leave", "Terminated"];
export const GENDER_OPTIONS = ["male", "female", "other"];
