import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import AsyncSelect from "react-select/async";
import type { GroupBase, StylesConfig } from "react-select";
import { debounce } from "lodash";

export interface AsyncSelectOption<T = any> {
  value: string;
  label: string;
  level?: number;
  original?: T;
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
}

interface AsyncSelectWithPaginationProps<T = any> {
  value?: string;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  loadOptions: (
    search: string,
    page: number
  ) => Promise<{
    options: AsyncSelectOption<T>[];
    meta: PaginationMeta;
  }>;
  debounceMs?: number;
}

const AsyncSelectWithPagination = <T,>({
  value,
  onChange,
  disabled = false,
  placeholder = "Select...",
  loadOptions,
  debounceMs = 500,
}: AsyncSelectWithPaginationProps<T>) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allOptions, setAllOptions] = useState<AsyncSelectOption<T>[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load options from provided function
  const fetchOptions = useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectOption<T>[]> => {
      try {
        const { options, meta } = await loadOptions(inputValue, page);

        // Update pagination state
        setHasMore(meta.hasMore);

        return options;
      } catch (error) {
        console.error("Failed to load options:", error);
        setHasMore(false);
        return [];
      }
    },
    [loadOptions]
  );

  // Initial load
  useEffect(() => {
    fetchOptions("", 1).then((options) => {
      setAllOptions(options);
      setPage(1);
    });
  }, [fetchOptions]);

  // Debounced search function
  const debouncedFetchOptions = useRef(
    debounce(async (inputValue: string, callback: (options: AsyncSelectOption<T>[]) => void) => {
      setPage(1);
      setHasMore(true);
      const options = await fetchOptions(inputValue, 1);
      callback(options);
    }, debounceMs)
  ).current;

  // Load options for search
  const handleLoadOptions = useCallback(
    (inputValue: string): Promise<AsyncSelectOption<T>[]> => {
      // If input is empty, return the cached initial options
      if (!inputValue || inputValue.trim() === "") {
        return Promise.resolve(allOptions);
      }

      // Return a promise that will be resolved by the debounced function
      return new Promise((resolve) => {
        debouncedFetchOptions(inputValue, resolve);
      });
    },
    [debouncedFetchOptions, allOptions]
  );

  // Load more options (for pagination)
  const loadMoreOptions = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const moreOptions = await fetchOptions("", nextPage);

    setAllOptions((prev) => [...prev, ...moreOptions]);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, page, fetchOptions]);

  // Handle menu scroll to bottom
  const handleMenuScrollToBottom = useCallback(() => {
    loadMoreOptions();
  }, [loadMoreOptions]);

  // Find selected option
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return allOptions.find((opt) => opt.value === value) || null;
  }, [value, allOptions]);

  // Handle change
  const handleChange = useCallback(
    (option: AsyncSelectOption<T> | null) => {
      onChange?.(option?.value || null);
    },
    [onChange]
  );

  // Custom styles to maintain hierarchy visual
  const customStyles: StylesConfig<AsyncSelectOption<T>, false, GroupBase<AsyncSelectOption<T>>> = {
    option: (provided, state) => ({
      ...provided,
      paddingLeft: `${8 + (state.data.level || 0) * 16}px`,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
        ? "hsl(var(--accent))"
        : "transparent",
      color: state.isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "hsl(var(--accent))",
      },
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
      boxShadow: state.isFocused ? "0 0 0 1px hsl(var(--ring))" : "none",
      "&:hover": {
        borderColor: "hsl(var(--ring))",
      },
      backgroundColor: "hsl(var(--background))",
      minHeight: "40px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#ffffff",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
      zIndex: 50,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "300px",
      backgroundColor: "#ffffff",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    input: (provided) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
  };

  return (
    <AsyncSelect<AsyncSelectOption<T>, false>
      cacheOptions={false}
      defaultOptions={allOptions}
      value={selectedOption}
      loadOptions={handleLoadOptions}
      onChange={handleChange}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      isDisabled={disabled}
      placeholder={placeholder}
      styles={customStyles}
      isClearable
      loadingMessage={() => "Memuat..."}
      noOptionsMessage={({ inputValue }) => (inputValue ? "Tidak ada hasil" : "Tidak ada opsi")}
      classNamePrefix="react-select"
      menuPosition="fixed"
      filterOption={() => true}
    />
  );
};

export default AsyncSelectWithPagination;
