import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Error404Page() {
  return (
    <div className="flex flex-col items-center justify-center grow min-h-screen py-24 px-4 md:px-8">
      <img src="/assets/images/widyatama-logo.png" className="w-[150px] max-w-full h-auto mb-24 -mt-24" alt="image" />
      <div className="mb-10">
        <img src={"/assets/images/404.svg"} className="max-h-[160px]" alt="image" />
      </div>
      <span className="badge badge-primary badge-outline mb-3">404</span>
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-2xl font-semibold text-mono text-center">Halaman tidak ditemukan</h3>
        <div className="text-base text-center text-foreground/80 max-w-[480px] w-full">
          URL yang Anda akses tidak tersedia atau sudah dihapus. Silakan periksa kembali URL atau
        </div>
        <Link to="/" className="mt-2">
          <Button>Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
