import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LecturerDashboardIndexPage = () => {
  return (
    <div className="app-container py-8">
      <Card>
        <CardContent>
          <p className="mb-3">
            Selamat Datang!
          </p>
          <Button variant="default" size="lg">
            Lihat Pengajuan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturerDashboardIndexPage;
