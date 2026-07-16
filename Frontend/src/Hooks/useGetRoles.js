import { useState, useEffect } from "react";
import axios from "axios";

const useGetRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles/get`
        );
        // Ensure data is handled as an array if your API returns the direct list
        setRoles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch custom workspace roles:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading };
};

export default useGetRole;