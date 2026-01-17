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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import type { TopicOffer } from "@/types/topic";
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { isAxiosError } from "axios";
import { debounce } from "lodash";
import { Edit, Ellipsis, Plus, Search, Trash, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

function ActionsCell({ row, onDelete }: { row: Row<TopicOffer>; onDelete: (topicOffer: TopicOffer) => void }) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/lecturer/topic-offers/${row.original.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(row.original);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="min-w-48">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="size-3.5" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash className="size-3.5" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const LecturerTopicOfferIndexPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper functions to read URL params
  const getInitialPagination = (): PaginationState => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    return {
      pageIndex: page ? parseInt(page) - 1 : 0,
      pageSize: pageSize ? parseInt(pageSize) : 10,
    };
  };

  const getInitialSorting = (): SortingState => {
    const sortBy = searchParams.get("sortBy");
    if (!sortBy) return [];
    const [id, direction] = sortBy.split(".");
    return [{ id, desc: direction === "desc" }];
  };

  const getInitialSearch = (): string => {
    return searchParams.get("search") || "";
  };

  const getInitialStatus = (): string | null => {
    return searchParams.get("status") || null;
  };

  const [statusFilter, setStatusFilter] = useState<string | null>(getInitialStatus());

  const [isInitialMount, setIsInitialMount] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>(getInitialPagination());

  const [sorting, setSorting] = useState<SortingState>(getInitialSorting());
  const [searchInput, setSearchInput] = useState(getInitialSearch());
  const [searchQuery, setSearchQuery] = useState(getInitialSearch());
  const [data, setData] = useState<TopicOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicOfferToDelete, setTopicOfferToDelete] = useState<TopicOffer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getTopicOffers = async (
    pageIndex: number,
    pageSize: number,
    search?: string,
    sorting?: SortingState,
    status?: string | null
  ) => {
    setIsLoading(true);

    let orderBy = "";
    let orderDirection = "";

    if (sorting && sorting.length > 0) {
      const sort = sorting[0];
      orderBy = sort.id;
      orderDirection = sort.desc ? "desc" : "asc";
    }

    const filters: Record<string, string> = {};
    if (status) {
      filters["status"] = status;
    }

    api
      .get(`/v1/lecturer/topic-offers`, {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search ?? "",
          order_by: orderBy,
          order_direction: orderDirection,
          filters: filters,
        },
      })
      .then((response) => {
        if (!response.data.error) {
          setData(response.data.data.data);
          setPageCount(response.data.data.last_page);
          setTotalItems(response.data.data.total);
        } else {
          toast.error(response.data.message || "Error fetching topic offers");
        }
      })
      .catch((error) => {
        console.error("Error fetching topic offers:", error);
        toast.error("Error fetching topic offers");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300),
    []
  );

  const handleDeleteTopicOffer = async () => {
    if (!topicOfferToDelete) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/v1/lecturer/topic-offers/${topicOfferToDelete.id}`);

      if (!response.data.error) {
        toast.success(response.data.message || "Topic offer deleted successfully");

        // Check if we need to reset to page 1
        const shouldResetPage =
          data.length === 1 && // Only 1 item on current page
          pagination.pageIndex > 0; // Not on first page

        // Refresh the data with appropriate page
        getTopicOffers(
          shouldResetPage ? 0 : pagination.pageIndex, // Reset to page 1 if needed
          pagination.pageSize,
          searchQuery,
          sorting,
          statusFilter
        );

        if (shouldResetPage) {
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }
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
      setTopicOfferToDelete(null);
    }
  };

  const openDeleteDialog = (topicOffer: TopicOffer) => {
    setTopicOfferToDelete(topicOffer);
    setDeleteDialogOpen(true);
  };

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add pagination
    if (pagination.pageIndex > 0) {
      params.set("page", String(pagination.pageIndex + 1));
    }
    if (pagination.pageSize !== 10) {
      params.set("pageSize", String(pagination.pageSize));
    }

    // Add search
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    // Add sorting
    if (sorting.length > 0) {
      const sort = sorting[0];
      params.set("sortBy", `${sort.id}.${sort.desc ? "desc" : "asc"}`);
    }

    // Add status filter
    if (statusFilter) {
      params.set("status", statusFilter);
    }

    setSearchParams(params, { replace: true });
  }, [pagination, searchQuery, sorting, statusFilter]);

  const columns = useMemo<ColumnDef<TopicOffer>[]>(
    () => [
      {
        id: "rowNumber",
        header: ({ column }) => <DataGridColumnHeader title={"No"} column={column} className="mx-auto" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        minSize: 70,
        size: 50,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "judul",
        accessorFn: (row) => row.judul,
        header: ({ column }) => <DataGridColumnHeader title="Judul Topik" column={column} />,
        cell: ({ row }) => <span className="font-normal text-foreground">{row.original.judul}</span>,
        enableSorting: true,
        enableHiding: false,
        enableResizing: false,
        size: 250,
      },
      {
        accessorKey: "kuota",
        accessorFn: (row) => row.kuota,
        header: ({ column }) => <DataGridColumnHeader title="Kuota" column={column} />,
        cell: ({ row }) => <span className="font-normal text-foreground">{row.original.kuota}</span>,
        enableSorting: true,
        enableHiding: false,
        enableResizing: false,
        size: 150,
      },
      {
        accessorKey: "pending_submissions_count",
        accessorFn: (row) => row.pending_submissions_count,
        header: ({ column }) => <DataGridColumnHeader title="Jumlah Pelamar Baru" column={column} />,
        cell: ({ row }) => (
          <span className="font-normal text-foreground">{row.original.pending_submissions_count}</span>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 180,
      },
      {
        accessorKey: "assigned_submissions_count",
        accessorFn: (row) => row.assigned_submissions_count,
        header: ({ column }) => <DataGridColumnHeader title="Jumlah Ditugaskan" column={column} />,
        cell: ({ row }) => (
          <span className="font-normal text-foreground">{row.original.assigned_submissions_count}</span>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 150,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: ({ column }) => <DataGridColumnHeader title={"Status"} column={column} />,
        cell: ({ row }) => {
          if (row.original.status === "ACTIVE") {
            return (
              <Badge size="sm" appearance="light" variant="success">
                Aktif
              </Badge>
            );
          }

          return (
            <Badge size="sm" appearance="light" variant="mono">
              Diarsipkan
            </Badge>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: "actions",
        header: ({ column }) => <DataGridColumnHeader title="Aksi" column={column} className="mx-auto" />,
        cell: ({ row }) => <ActionsCell row={row} onDelete={openDeleteDialog} />,
        enableSorting: false,
        minSize: 100,
        size: 100,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  const table = useReactTable({
    columns,
    data,
    pageCount,
    getRowId: (row: TopicOffer) => String(row.id),
    state: {
      pagination,
      sorting,
    },
    columnResizeMode: "onChange",
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    if (isInitialMount) return;

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter]);

  useEffect(() => {
    getTopicOffers(pagination.pageIndex, pagination.pageSize, searchQuery, sorting, statusFilter);
  }, [pagination.pageIndex, pagination.pageSize, searchQuery, sorting, statusFilter]);

  return (
    <Fragment>
      <div className="app-container py-8">
        <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-xl font-medium leading-none text-mono">Topik</h1>
            <div className="flex items-center gap-2 text-sm font-normal text-secondary-foreground">
              Lihat dan kelola topik yang ditawarkan
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/lecturer/topic-offers/create">
              <Button className="flex gap-1 items-center">
                <Plus />
                <span>Tambah Topik</span>
              </Button>
            </Link>
          </div>
        </div>
        <DataGrid
          table={table}
          recordCount={totalItems}
          isLoading={isLoading}
          loadingMode="spinner"
          loadingMessage={"Loading"}
          onRowClick={(row: TopicOffer) => navigate(`/lecturer/topic-offers/${row.id}`)}
          tableLayout={{
            columnsPinnable: true,
            columnsMovable: true,
            columnsVisibility: true,
            cellBorder: true,
          }}
        >
          <Card className="gap-0">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
                <CardTitle>Topik Ditawarkan Saya</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={statusFilter ?? ""}
                    onValueChange={(value) => {
                      if (value && value !== "ALL") {
                        setStatusFilter(value);
                      } else {
                        setStatusFilter(null);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ALL">Semua</SelectItem>
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full md:w-fit">
                    <Search className="absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground start-2" />
                    <Input
                      placeholder={"Cari..."}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full md:w-64 ps-7"
                    />
                    {isLoading && (
                      <div className="absolute top-1/2 -translate-y-1/2 end-3">
                        <div className="w-4 h-4 rounded-full animate-spin border border-muted-foreground border-t-transparent" />
                      </div>
                    )}
                    {searchInput.length > 0 && !isLoading && (
                      <Button
                        variant="ghost"
                        className="absolute end-1.5 top-1/2 -translate-y-1/2 h-5 w-5"
                        onClick={() => setSearchInput("")}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Hapus Topik</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Apakah Anda yakin ingin menghapus topik ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex gap-3 justify-center w-full">
              <AlertDialogCancel disabled={isDeleting} variant="outline" className="flex-1">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTopicOffer}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
};

export default LecturerTopicOfferIndexPage;
