import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { toast } from "sonner";
import { createTopicOfferSchema, type TopicOfferFormValues } from "./components/forms";
import TopicOfferFormFields from "./components/topic-offer-form-fields";

const LecturerTopicOfferCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<TopicOfferFormValues | null>(null);

  const topicOfferSchema = createTopicOfferSchema();

  const form = useForm<TopicOfferFormValues>({
    resolver: zodResolver(topicOfferSchema),
    defaultValues: {
      judul: "",
      deskripsi: "",
      keywords: [],
      prasyarat: "",
      kuota: NaN,
      bidang_id: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  const handleSubmit = (data: TopicOfferFormValues) => {
    if (isSubmitting) {
      return;
    }

    // Show confirmation dialog first
    setFormDataToSubmit(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    if (!formDataToSubmit) return;

    setIsSubmitting(true);
    api
      .post("/v1/lecturer/topic-offers", formDataToSubmit)
      .then((res) => {
        toast.success(res.data.message ?? "Topic offer created successfully");
        navigate("/lecturer/topic-offers", { replace: true });
      })
      .catch((err) => {
        if (isAxiosError(err)) {
          // Handle validation errors (422)
          if (err.response?.status === 422 && err.response?.data?.data) {
            const validationErrors = err.response.data.data;

            // Map validation errors to form fields
            validationErrors.forEach((error: any) => {
              const fieldPath = error.path;
              if (fieldPath && fieldPath.length > 0) {
                const fieldName = fieldPath[fieldPath.length - 1]; // Get the last part of the path
                form.setError(fieldName as any, {
                  type: "server",
                  message: error.message,
                });
              }
            });

            // Show toast with first error message
            const firstError = validationErrors[0];
            toast.error(firstError?.message ?? "Validation failed");
          } else {
            toast.error(err.response?.data?.message ?? "Failed to create topic offer");
          }
        } else {
          toast.error("Failed to create topic offer");
        }
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
        setShowConfirmDialog(false);
        setFormDataToSubmit(null);
      });
  };

  return (
    <Fragment>
      <div className="app-container py-8">
        <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-xl font-medium leading-none text-mono">Form Tambah Topik</h1>
            <div className="flex items-center gap-2 text-sm font-normal text-secondary-foreground">
              Buat topik baru untuk ditawarkan
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="block w-full">
            <Card className="mb-16">
              <CardHeader className="border-b">
                <CardTitle>Form Tambah Topik</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicOfferFormFields control={form.control} isSubmitting={isSubmitting} />
              </CardContent>
              <CardFooter>
                <div className="w-full flex sm:flex-row flex-col justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="max-w-full sm:w-24"
                    size="sm"
                    onClick={() => navigate("/lecturer/topic-offers", { replace: true })}
                  >
                    Kembali
                  </Button>
                  <Button type="submit" className="w-full max-w-full sm:w-36" disabled={isSubmitting}>
                    Simpan
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Simpan</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Apakah anda yakin ingin menyimpan data ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex gap-3 justify-center w-full">
              <AlertDialogCancel disabled={isSubmitting} className="flex-1">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
};

export default LecturerTopicOfferCreatePage;
