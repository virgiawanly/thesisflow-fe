import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import AsyncSelect from "react-select/async";
import type { GroupBase, StylesConfig } from "react-select";
import { debounce } from "lodash";
import api from "@/lib/axios";
import type { NestedFieldTaxonomy } from "@/types/field-taxonomy";

interface FlattenedOption {
  value: string;
  label: string;
  level: number;
  original: NestedFieldTaxonomy;
}

interface AsyncFieldTaxonomySelectProps {
  value?: string;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Flatten nested taxonomy into selectable options
const flattenTaxonomy = (taxonomies: NestedFieldTaxonomy[], level = 0): FlattenedOption[] => {
  const result: FlattenedOption[] = [];

  taxonomies.forEach((taxonomy) => {
    // Add current item with just the name (no prefix)
    result.push({
      value: taxonomy.id.toString(),
      label: taxonomy.nama,
      level,
      original: taxonomy,
    });

    // Add children recursively
    if (taxonomy.nested_children && taxonomy.nested_children.length > 0) {
      result.push(...flattenTaxonomy(taxonomy.nested_children, level + 1));
    }
  });

  return result;
};

const AsyncFieldTaxonomySelect = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Pilih bidang...",
}: AsyncFieldTaxonomySelectProps) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allOptions, setAllOptions] = useState<FlattenedOption[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load options from API
  const loadOptions = useCallback(async (inputValue: string, page = 1): Promise<FlattenedOption[]> => {
    try {
      const response = await api.get("/v1/misc/field-taxonomies", {
        params: {
          search: inputValue || undefined,
          page,
          limit: 50, // Load 50 items per page
        },
      });

      console.log(response.data.data);

      // Laravel pagination structure: data, current_page, last_page are at root level
      const data = response.data.data.data ?? [];
      const currentPage = response.data.data.current_page || page;
      const lastPage = response.data.data.last_page || 1;

      // Check if there are more pages
      setHasMore(currentPage < lastPage);

      // Flatten the nested structure
      return flattenTaxonomy(data);
    } catch (error) {
      console.error("Failed to load field taxonomies:", error);
      setHasMore(false);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOptions("", 1).then((options) => {
      setAllOptions(options);
      setPage(1);
    });
  }, [loadOptions]);

  // Debounced search function
  const debouncedLoadOptions = useRef(
    debounce(async (inputValue: string, callback: (options: FlattenedOption[]) => void) => {
      setPage(1);
      setHasMore(true);
      const options = await loadOptions(inputValue, 1);
      callback(options);
    }, 500)
  ).current;

  // Load options for search
  const handleLoadOptions = useCallback(
    (inputValue: string): Promise<FlattenedOption[]> => {
      // If input is empty, return the cached initial options
      if (!inputValue || inputValue.trim() === "") {
        return Promise.resolve(allOptions);
      }

      // Return a promise that will be resolved by the debounced function
      return new Promise((resolve) => {
        debouncedLoadOptions(inputValue, resolve);
      });
    },
    [debouncedLoadOptions, allOptions]
  );

  // Load more options (for pagination)
  const loadMoreOptions = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const moreOptions = await loadOptions("", nextPage);

    setAllOptions((prev) => [...prev, ...moreOptions]);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, page, loadOptions]);

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
    (option: FlattenedOption | null) => {
      onChange?.(option?.value || null);
    },
    [onChange]
  );

  // Custom styles to maintain hierarchy visual
  const customStyles: StylesConfig<FlattenedOption, false, GroupBase<FlattenedOption>> = {
    option: (provided, state) => ({
      ...provided,
      paddingLeft: `${8 + state.data.level * 16}px`,
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
    <AsyncSelect<FlattenedOption, false>
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

export default AsyncFieldTaxonomySelect;
