import { useEffect, useState } from "react";
import axios from "axios";
import useDebounce from "../../../../../Hooks/useDebounce";

export const useEntitySearch = (fetcher, { skip = false } = {}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (skip || !debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    fetcher(debouncedQuery, controller.signal)
      .then((response) => {
        if (response.data?.success) setResults(response.data.data || []);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) console.error("Search failed:", err);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, skip]);

  return { query, setQuery, results, setResults, isLoading };
};
