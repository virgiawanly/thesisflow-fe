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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import type { TopicOffer } from "@/types/topic";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const LecturerTopicOfferDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TopicOffer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load topic offer data
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    api
      .get(`/v1/lecturer/topic-offers/${id}`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data topik");
        navigate("/404", { replace: true });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const parseKeywords = (keywords: string) => {
    try {
      const parsed = JSON.parse(keywords);
      return Array.isArray(parsed) ? parsed.join(", ") : keywords;
    } catch {
      return keywords;
    }
  };

  const handleDeleteTopicOffer = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/v1/lecturer/topic-offers/${id}`);
      if (!response.data.error) {
        toast.success(response.data.message || "Topic offer deleted successfully");
        navigate("/lecturer/topic-offers", { replace: true });
      } else {
        toast.error(response.data.message || "Error deleting topic offer");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error deleting topic offer");
      } else {
        toast.error("Error deleting topic offer");
      }
      console.error("Error deleting topic offer:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="app-container py-8">
        <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-xl font-medium leading-none text-mono">Detail Topik</h1>
            <div className="flex items-center gap-2 text-sm font-normal text-secondary-foreground">
              Lihat detail topik yang ditawarkan dosen
            </div>
          </div>
        </div>

        {isLoading && (
          <Card className="mb-16">
            <CardContent className="py-8">
              <div className="flex justify-center items-center gap-2">
                <LoaderCircle className="animate-spin size-4 text-primary" />
                <span className="text-secondary-foreground">Memuat data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && data && (
          <Card className="mb-16">
            <CardHeader className="border-b flex gap-3 flex-wrap flex-row items-center justify-between">
              <CardTitle>Detail Topik</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                  Hapus
                </Button>
                <Button size="sm" onClick={() => navigate(`/lecturer/topic-offers/${id}/edit`)}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Judul</div>
                  <div className="text-foreground">{data.judul}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Deskripsi</div>
                  <div className="text-foreground whitespace-pre-wrap">{data.deskripsi}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Bidang</div>
                  <div className="text-foreground">{data.bidang?.nama || "-"}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Keywords</div>
                  <div className="text-foreground">{parseKeywords(data.keywords)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Prasyarat</div>
                  <div className="text-foreground whitespace-pre-wrap">{data.prasyarat || "-"}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Kuota</div>
                  <div className="text-foreground">{data.kuota} Mahasiswa</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Status</div>
                  <div>
                    {data.status === "ACTIVE" ? (
                      <Badge size="sm" appearance="light" variant="success">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge size="sm" appearance="light" variant="mono">
                        Diarsipkan
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <div className="font-medium text-foreground">Dibuat Pada</div>
                  <div className="text-foreground">{data.created_at ? formatDate(data.created_at) : "-"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{"Delete Topic Offer"}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {"Are you sure you want to delete this topic offer?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex gap-3 justify-center w-full">
              <AlertDialogCancel disabled={isDeleting} variant="outline" className="flex-1">
                {"Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTopicOffer}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? "Deleting" : "Confirm"}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LecturerTopicOfferDetailPage;
