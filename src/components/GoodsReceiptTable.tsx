"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { Card, CardContent } from "./ui/card"
import {
  Search,
  Download,
  Columns3,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  MoreHorizontal,
  Plus,
  Printer,
  Copy,
  XCircle,
} from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { Badge } from "./ui/badge"
import { toast } from "sonner"

// Types
interface GoodsReceiptItem {
  id: string
  receiptNo: string
  receiptType: "PO Receipt" | "Return" | "Transfer In" | "Other"
  refNo: string
  partner: string
  destinationWarehouse: string
  status: "Draft" | "Receiving" | "Completed" | "Cancelled"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export function GoodsReceiptTable() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GoodsReceiptItem>("receiptNo")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filters
  const [filters, setFilters] = useState({
    receiptType: "all",
    status: "all",
    warehouse: "all",
    partner: "all",
    fromDate: "",
    toDate: "",
  })

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "receiptNo",
    "receiptType",
    "refNo",
    "partner",
    "destinationWarehouse",
    "status",
    "createdBy",
    "createdAt",
    "updatedAt",
  ])

  // Modals
  const [viewItem, setViewItem] = useState<GoodsReceiptItem | null>(null)
  const [editItem, setEditItem] = useState<GoodsReceiptItem | null>(null)
  const [cancelItem, setCancelItem] = useState<GoodsReceiptItem | null>(null)

  // Mock data
  const [receipts] = useState<GoodsReceiptItem[]>([
    {
      id: "1",
      receiptNo: "GR-2025-001",
      receiptType: "PO Receipt",
      refNo: "PO-2025-100",
      partner: "Supplier ABC Co., Ltd",
      destinationWarehouse: "Main Warehouse",
      status: "Completed",
      createdBy: "John Doe",
      createdAt: "2025-01-15 09:00",
      updatedAt: "2025-01-15 14:30",
    },
    {
      id: "2",
      receiptNo: "GR-2025-002",
      receiptType: "Transfer In",
      refNo: "TRF-2025-050",
      partner: "North Branch",
      destinationWarehouse: "Main Warehouse",
      status: "Receiving",
      createdBy: "Jane Smith",
      createdAt: "2025-01-20 10:30",
      updatedAt: "2025-01-20 15:00",
    },
    {
      id: "3",
      receiptNo: "GR-2025-003",
      receiptType: "Return",
      refNo: "RET-2025-010",
      partner: "Customer XYZ Ltd",
      destinationWarehouse: "Distribution Center",
      status: "Draft",
      createdBy: "Mike Johnson",
      createdAt: "2025-01-25 11:20",
      updatedAt: "2025-01-25 11:20",
    },
    {
      id: "4",
      receiptNo: "GR-2025-004",
      receiptType: "PO Receipt",
      refNo: "PO-2025-101",
      partner: "Supplier DEF Inc.",
      destinationWarehouse: "Main Warehouse",
      status: "Completed",
      createdBy: "Sarah Wilson",
      createdAt: "2025-01-28 08:00",
      updatedAt: "2025-01-28 16:45",
    },
    {
      id: "5",
      receiptNo: "GR-2025-005",
      receiptType: "Other",
      refNo: "ADJ-2025-005",
      partner: "Internal",
      destinationWarehouse: "North Warehouse",
      status: "Cancelled",
      createdBy: "Admin User",
      createdAt: "2025-01-29 14:00",
      updatedAt: "2025-01-29 15:00",
    },
  ])

  // Filter options
  const receiptTypeOptions = [
    { value: "PO Receipt", label: t("receipt_type_po") },
    { value: "Return", label: t("receipt_type_return") },
    { value: "Transfer In", label: t("receipt_type_transfer_in") },
    { value: "Other", label: t("receipt_type_other") },
  ]

  const statusOptions = [
    { value: "Draft", label: t("draft") },
    { value: "Receiving", label: t("receiving") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ]

  const warehouseOptions = [
    { value: "Main Warehouse", label: "Main Warehouse" },
    { value: "Distribution Center", label: "Distribution Center" },
    { value: "North Warehouse", label: "North Warehouse" },
  ]

  const partnerOptions = [
    { value: "Supplier ABC Co., Ltd", label: "Supplier ABC Co., Ltd" },
    { value: "Supplier DEF Inc.", label: "Supplier DEF Inc." },
    { value: "Customer XYZ Ltd", label: "Customer XYZ Ltd" },
    { value: "North Branch", label: "North Branch" },
    { value: "Internal", label: "Internal" },
  ]

  const columnOptions = [
    { value: "receiptNo", label: t("receipt_no") },
    { value: "receiptType", label: t("receipt_type") },
    { value: "refNo", label: t("ref_no") },
    { value: "partner", label: t("partner") },
    { value: "destinationWarehouse", label: t("destination_warehouse") },
    { value: "status", label: t("status") },
    { value: "createdBy", label: t("created_by") },
    { value: "createdAt", label: t("created_at") },
    { value: "updatedAt", label: t("updated_at") },
  ]

  // Filter and sort data
  const filteredData = receipts.filter((item) => {
    if (filters.receiptType !== "all" && item.receiptType !== filters.receiptType) return false
    if (filters.status !== "all" && item.status !== filters.status) return false
    if (filters.warehouse !== "all" && item.destinationWarehouse !== filters.warehouse) return false
    if (filters.partner !== "all" && item.partner !== filters.partner) return false
    if (
      searchTerm &&
      !item.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.refNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.partner.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.destinationWarehouse.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (column: keyof GoodsReceiptItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleResetFilters = () => {
    setFilters({
      receiptType: "all",
      status: "all",
      warehouse: "all",
      partner: "all",
      fromDate: "",
      toDate: "",
    })
    setSearchTerm("")
    toast.success(t("reset_filters"))
  }

  const handleExport = () => {
    toast.success(t("export_started"))
  }

  const handleCreate = () => {
    window.location.hash = "create-goods-receipt"
  }

  const handleView = (item: GoodsReceiptItem) => {
    window.location.hash = "goods-receipt-detail"
  }
  // </CHANGE>

  const handleEdit = (item: GoodsReceiptItem) => {
    if (item.status === "Completed") {
      toast.error(t("cannot_edit_completed"))
      return
    }
    if (item.status === "Cancelled") {
      toast.error("Cannot edit cancelled receipt")
      return
    }
    toast.info("Edit functionality will be implemented in next phase")
  }

  const handleCancel = (item: GoodsReceiptItem) => {
    if (item.status === "Completed") {
      toast.error(t("cannot_cancel_completed"))
      return
    }
    if (item.status === "Cancelled") {
      toast.error("Receipt is already cancelled")
      return
    }
    setCancelItem(item)
  }

  const confirmCancel = () => {
    if (cancelItem) {
      toast.success(t("receipt_cancelled_successfully"))
      setCancelItem(null)
    }
  }

  const handlePrint = (item: GoodsReceiptItem) => {
    toast.info(`Printing receipt ${item.receiptNo}`)
  }

  const handleCopy = (item: GoodsReceiptItem) => {
    toast.info(`Copying receipt ${item.receiptNo}`)
  }

  const getStatusBadgeVariant = (status: GoodsReceiptItem["status"]) => {
    switch (status) {
      case "Draft":
        return "secondary"
      case "Receiving":
        return "default"
      case "Completed":
        return "default"
      case "Cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getReceiptTypeLabel = (type: GoodsReceiptItem["receiptType"]) => {
    switch (type) {
      case "PO Receipt":
        return t("receipt_type_po")
      case "Return":
        return t("receipt_type_return")
      case "Transfer In":
        return t("receipt_type_transfer_in")
      case "Other":
        return t("receipt_type_other")
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`${t("search")} ${t("receipt_no")}, ${t("ref_no")}, ${t("partner")}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                {t("reset_filters")}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 className="h-4 w-4 mr-2" />
                    {t("column_visibility")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {columnOptions.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.value}
                      checked={visibleColumns.includes(column.value)}
                      onCheckedChange={(checked) => {
                        setVisibleColumns(
                          checked
                            ? [...visibleColumns, column.value]
                            : visibleColumns.filter((col) => col !== column.value),
                        )
                      }}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t("export_excel")}
              </Button>
              <Button variant="default" size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                {t("add_new")}
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>{t("receipt_type")}</Label>
              <Select
                value={filters.receiptType}
                onValueChange={(value) => setFilters({ ...filters, receiptType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {receiptTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("status")}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("warehouse")}</Label>
              <Select value={filters.warehouse} onValueChange={(value) => setFilters({ ...filters, warehouse: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {warehouseOptions.map((warehouse) => (
                    <SelectItem key={warehouse.value} value={warehouse.value}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("partner")}</Label>
              <Select value={filters.partner} onValueChange={(value) => setFilters({ ...filters, partner: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {partnerOptions.map((partner) => (
                    <SelectItem key={partner.value} value={partner.value}>
                      {partner.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes("receiptNo") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("receiptNo")}>
                      {t("receipt_no")}
                      {sortColumn === "receiptNo" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("receiptType") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("receiptType")}>
                      {t("receipt_type")}
                      {sortColumn === "receiptType" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("refNo") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("refNo")}>
                      {t("ref_no")}
                      {sortColumn === "refNo" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("partner") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("partner")}>
                      {t("partner")}
                      {sortColumn === "partner" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("destinationWarehouse") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("destinationWarehouse")}>
                      {t("destination_warehouse")}
                      {sortColumn === "destinationWarehouse" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("status") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      {t("status")}
                      {sortColumn === "status" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("createdBy") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdBy")}>
                      {t("created_by")}
                      {sortColumn === "createdBy" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("createdAt") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                      {t("created_at")}
                      {sortColumn === "createdAt" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  {visibleColumns.includes("updatedAt") && (
                    <TableHead className="cursor-pointer" onClick={() => handleSort("updatedAt")}>
                      {t("updated_at")}
                      {sortColumn === "updatedAt" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  )}
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="text-center py-8 text-muted-foreground">
                      {searchTerm || Object.values(filters).some((f) => f !== "all" && f !== "")
                        ? t("no_matching_receipts")
                        : t("no_receipts_message")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onDoubleClick={() => handleView(item)}
                      title={t("double_click_to_view_receipt")}
                    >
                      {visibleColumns.includes("receiptNo") && (
                        <TableCell className="font-medium">{item.receiptNo}</TableCell>
                      )}
                      {visibleColumns.includes("receiptType") && (
                        <TableCell>
                          <Badge variant="outline">{getReceiptTypeLabel(item.receiptType)}</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("refNo") && <TableCell>{item.refNo}</TableCell>}
                      {visibleColumns.includes("partner") && <TableCell>{item.partner}</TableCell>}
                      {visibleColumns.includes("destinationWarehouse") && (
                        <TableCell>{item.destinationWarehouse}</TableCell>
                      )}
                      {visibleColumns.includes("status") && (
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.status) as any}>
                            {t(item.status.toLowerCase())}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("createdBy") && <TableCell>{item.createdBy}</TableCell>}
                      {visibleColumns.includes("createdAt") && <TableCell>{item.createdAt}</TableCell>}
                      {visibleColumns.includes("updatedAt") && <TableCell>{item.updatedAt}</TableCell>}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("view")}
                            </DropdownMenuItem>
                            {(item.status === "Draft" || item.status === "Receiving") && (
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("edit")}
                              </DropdownMenuItem>
                            )}
                            {(item.status === "Draft" || item.status === "Receiving") && (
                              <DropdownMenuItem onClick={() => handleCancel(item)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                {t("cancel")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handlePrint(item)}>
                              <Printer className="mr-2 h-4 w-4" />
                              {t("print")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(item)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t("copy")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paginatedData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("showing")} {(currentPage - 1) * itemsPerPage + 1} {t("of")}{" "}
                  {Math.min(currentPage * itemsPerPage, sortedData.length)} {t("of")} {sortedData.length} {t("entries")}
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {t("page")} {currentPage} {t("of")} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Detail Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-2xl">
          {viewItem && (
            <>
              <DialogHeader>
                <DialogTitle>{t("receipt_details")}</DialogTitle>
                <DialogDescription>
                  {viewItem.receiptNo} - {getReceiptTypeLabel(viewItem.receiptType)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t("receipt_no")}</Label>
                    <p className="font-medium">{viewItem.receiptNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("receipt_type")}</Label>
                    <p>
                      <Badge variant="outline">{getReceiptTypeLabel(viewItem.receiptType)}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("ref_no")}</Label>
                    <p>{viewItem.refNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("partner")}</Label>
                    <p>{viewItem.partner}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("destination_warehouse")}</Label>
                    <p>{viewItem.destinationWarehouse}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("status")}</Label>
                    <p>
                      <Badge variant={getStatusBadgeVariant(viewItem.status) as any}>
                        {t(viewItem.status.toLowerCase())}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("created_by")}</Label>
                    <p>{viewItem.createdBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("created_at")}</Label>
                    <p>{viewItem.createdAt}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{t("updated_at")}</Label>
                    <p>{viewItem.updatedAt}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewItem(null)}>
                  {t("close")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelItem} onOpenChange={(open) => !open && setCancelItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancel_receipt")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm_cancel_receipt")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>{t("confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
