import { z } from "zod";

export const getLoginSchema = () => {
  return z.object({
    username: z.string().min(1, { message: "Username is required." }),
    password: z.string().min(1, { message: "Password is required." }),
  });
};

export type LoginSchemaType = z.infer<ReturnType<typeof getLoginSchema>>;
