import AsyncSelectWithPagination, {
  type AsyncSelectOption,
  type PaginationMeta,
} from "@/components/common/AsyncSelectWithPagination";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import type { NestedFieldTaxonomy } from "@/types/field-taxonomy";
import type { Control } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import type { TopicOfferFormValues } from "./forms";

interface TopicOfferFormFieldsProps {
  control: Control<TopicOfferFormValues>;
  isSubmitting: boolean;
}

const TopicOfferFormFields = ({ control, isSubmitting }: TopicOfferFormFieldsProps) => {
  // Flatten nested taxonomy into selectable options
  const flattenTaxonomy = (taxonomies: NestedFieldTaxonomy[], level = 0): AsyncSelectOption<NestedFieldTaxonomy>[] => {
    const result: AsyncSelectOption<NestedFieldTaxonomy>[] = [];

    taxonomies.forEach((taxonomy) => {
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

  const loadFieldTaxonomies = async (
    search: string,
    page: number
  ): Promise<{ options: AsyncSelectOption<NestedFieldTaxonomy>[]; meta: PaginationMeta }> => {
    const response = await api.get("/v1/misc/field-taxonomies", {
      params: {
        search: search || undefined,
        page,
        limit: 50,
      },
    });

    const data = response.data.data.data ?? [];
    const currentPage = response.data.data.current_page || page;
    const lastPage = response.data.data.last_page || 1;

    return {
      options: flattenTaxonomy(data),
      meta: {
        currentPage,
        lastPage,
        hasMore: currentPage < lastPage,
      },
    };
  };

  return (
    <div className="py-3 flex flex-col gap-5">
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel required className="font-normal">
            Judul
          </FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="judul"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Masukkan judul" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel required className="font-normal">
            Deksripsi
          </FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="deskripsi"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Masukkan deksripsi (min. 150 kata)" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel required className="font-normal">
            Bidang
          </FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="bidang_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AsyncSelectWithPagination<NestedFieldTaxonomy>
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value ?? "")}
                    disabled={isSubmitting}
                    placeholder="Pilih bidang"
                    loadOptions={loadFieldTaxonomies}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel required className="font-normal">
            Keywords (1-5)
          </FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="keywords"
            render={({ field }) => {
              const keywordArray = field.value || [];
              const options = keywordArray.map((keyword) => ({ value: keyword, label: keyword }));

              return (
                <FormItem>
                  <FormControl>
                    <CreatableSelect
                      isMulti
                      value={options}
                      onChange={(newValue) => {
                        const keywords = newValue.map((item: { value: string; label: string }) => item.value);
                        field.onChange(keywords);
                      }}
                      onCreateOption={(inputValue: string) => {
                        if (keywordArray.length >= 5) {
                          return;
                        }
                        const newKeywords = [...keywordArray, inputValue];
                        field.onChange(newKeywords);
                      }}
                      options={[]}
                      placeholder="Ketik dan tekan Enter (maks. 5)"
                      isDisabled={isSubmitting}
                      noOptionsMessage={() => "Ketik untuk menambahkan keyword"}
                      formatCreateLabel={(inputValue: string) => `Tambah "${inputValue}"`}
                      isValidNewOption={(inputValue: string) => {
                        return inputValue.trim().length > 0 && keywordArray.length < 5;
                      }}
                      components={{
                        DropdownIndicator: () => null,
                      }}
                      styles={{
                        control: (base: any) => ({
                          ...base,
                          minHeight: "40px",
                          borderColor: "hsl(var(--input))",
                          backgroundColor: "hsl(var(--background))",
                          "&:hover": {
                            borderColor: "hsl(var(--input))",
                          },
                        }),
                        multiValue: (base: any) => ({
                          ...base,
                          backgroundColor: "hsl(var(--secondary))",
                        }),
                        multiValueLabel: (base: any) => ({
                          ...base,
                          color: "hsl(var(--secondary-foreground))",
                        }),
                        multiValueRemove: (base: any) => ({
                          ...base,
                          color: "hsl(var(--secondary-foreground))",
                          "&:hover": {
                            backgroundColor: "hsl(var(--destructive))",
                            color: "hsl(var(--destructive-foreground))",
                          },
                        }),
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel className="font-normal">Prasyarat</FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="prasyarat"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Masukkan prasyarat (opsional)" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel required className="font-normal">
            Kuota
          </FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="kuota"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Masukkan kuota"
                    disabled={isSubmitting}
                    value={isNaN(field.value) ? "" : field.value}
                    onChange={(e) => {
                      const val = e.target.valueAsNumber;
                      field.onChange(val);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex md:flex-row md:items-start flex-col gap-2.5">
        <div className="w-full md:max-w-48">
          <FormLabel required className="font-normal">
            Status
          </FormLabel>
        </div>
        <div className="flex-1 md:max-w-[500px]">
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RadioGroup
                    className="flex flex-wrap gap-8"
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ACTIVE" id="active" />
                      <Label htmlFor="active">Aktif</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ARCHIVED" id="archived" />
                      <Label htmlFor="archived">Diarsipkan</Label>
                    </div>
                  </RadioGroup>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicOfferFormFields;
