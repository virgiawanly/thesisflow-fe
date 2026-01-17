import { z } from "zod";

export const createTopicOfferSchema = () => {
  return z.object({
    judul: z.string().min(2, "Field ini harus diisi"),
    deskripsi: z
      .string()
      .min(1, "Field ini harus diisi")
      .refine(
        (val) => {
          const wordCount = val
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
          return wordCount >= 150;
        },
        { message: "Deskripsi minimal 150 kata" }
      ),
    keywords: z.array(z.string()).min(1, "Field ini harus diisi"),
    prasyarat: z.string().optional(),
    kuota: z
      .number()
      .refine((val) => !isNaN(val), { message: "Field ini harus diisi" })
      .refine((val) => val >= 1, { message: "Kuota minimal 1" }),
    bidang_id: z.string().min(1, "Field ini harus diisi"),
    status: z.string().min(1, "Field ini harus diisi"),
  });
};

export const topicOfferSchema = createTopicOfferSchema();

export type TopicOfferFormValues = z.infer<typeof topicOfferSchema>;
