"use client"

import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Download, CheckCircle, XCircle, Ban } from "lucide-react"
import { toast } from "sonner"
import { LineDetailDialog } from "../components/LineDetailDialog"

interface ReceiptLine {
  id: string
  lineNo: number
  modelAsset: string
  modelAssetName: string
  trackingType: "None" | "Serial" | "Lot"
  unit: string
  plannedQuantity: number
  quantityEntered: number
  diffQuantity: number
  serials?: string[]
  lots?: Array<{
    lotNo: string
    mfgDate?: string
    expDate?: string
    qty: number
  }>
}

interface StatusHistory {
  status: string
  timestamp: string
  user: string
  note?: string
}

export function GoodsReceiptDetail() {
  const { t } = useLanguage()

  const [receiptData] = useState({
    goodsReceiptNo: "GR0123456",
    goodsReceiptType: "Receipt by PO",
    refNo: "PO-2024-001",
    docDate: "21/08/2024",
    createdBy: "Quản lý kho",
    createdDate: "08:25 21/08/2024",
    expectedReceiptDate: "24/08/2024",
    destinationWarehouse: "Kho Vũng Tàu",
    partner: "Supplier Dep trai",
    status: "Submitted" as "Draft" | "New" | "Receiving" | "Submitted" | "Completed" | "Rejected" | "Cancelled",
    handler: "Nhân viên kho",
    approvedBy: "",
    approvedDate: "",
    note: "",
  })

  const [statusHistory] = useState<StatusHistory[]>([
    {
      status: "Draft",
      timestamp: "08:20 21/08/2024",
      user: "Nhân viên kho",
      note: "Created draft",
    },
    {
      status: "New",
      timestamp: "08:25 21/08/2024",
      user: "Nhân viên kho",
      note: "Submitted for receiving",
    },
    {
      status: "Receiving",
      timestamp: "09:15 21/08/2024",
      user: "Nhân viên kho",
      note: "Started receiving goods",
    },
    {
      status: "Submitted",
      timestamp: "14:30 21/08/2024",
      user: "Nhân viên kho",
      note: "Completed receiving, awaiting approval",
    },
  ])

  const [lines] = useState<ReceiptLine[]>([
    {
      id: "1",
      lineNo: 1,
      modelAsset: "LAP001",
      modelAssetName: "Dell Laptop Inspiron 15",
      trackingType: "Serial",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "2",
      lineNo: 2,
      modelAsset: "LAP001",
      modelAssetName: "COMPRESSOR FH2588-5W (220V,50/60Hz,)",
      trackingType: "Serial",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "3",
      lineNo: 3,
      modelAsset: "LAP001",
      modelAssetName: "COMPRESSOR BA-74432",
      trackingType: "Lot",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "4",
      lineNo: 4,
      modelAsset: "LAP001",
      modelAssetName: "DOOR_GASKET_485X878",
      trackingType: "Serial",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "5",
      lineNo: 5,
      modelAsset: "LAP001",
      modelAssetName: "DOOR PROC. BLUE LETG/TG CAC-0123E11A",
      trackingType: "Lot",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "6",
      lineNo: 6,
      modelAsset: "LAP001",
      modelAssetName: "DOOR GASKET 513X1295",
      trackingType: "Serial",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "7",
      lineNo: 7,
      modelAsset: "LAP001",
      modelAssetName: "MOTOR_EBM_5W_M4Q045BD01-83",
      trackingType: "Serial",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
    {
      id: "8",
      lineNo: 8,
      modelAsset: "LAP001",
      modelAssetName: "CAPACITOR 40MFD-370VAC MARK VDE",
      trackingType: "None",
      unit: "PCS",
      plannedQuantity: 100,
      quantityEntered: 100,
      diffQuantity: 0,
    },
  ])

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<ReceiptLine | null>(null)
  const [lineDialogOpen, setLineDialogOpen] = useState(false)

  const handleExport = () => {
    toast.info(t("export_feature_coming_soon"))
  }

  const handleViewLine = (line: ReceiptLine) => {
    setSelectedLine(line)
    setLineDialogOpen(true)
  }

  const handleApprove = () => {
    console.log("[v0] Approving receipt:", receiptData.goodsReceiptNo)
    toast.success(t("goods_receipt_approved"))
    setApproveDialogOpen(false)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleReject = () => {
    console.log("[v0] Rejecting receipt:", receiptData.goodsReceiptNo)
    toast.success(t("goods_receipt_rejected"))
    setRejectDialogOpen(false)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleCancel = () => {
    console.log("[v0] Cancelling receipt:", receiptData.goodsReceiptNo)
    toast.success(t("goods_receipt_cancelled"))
    setCancelDialogOpen(false)
    setTimeout(() => {
      window.location.hash = "goods-receipt"
    }, 1000)
  }

  const handleBack = () => {
    window.location.hash = "goods-receipt"
  }

  const getTotalItems = () => {
    return lines.reduce((sum, line) => sum + line.quantityEntered, 0)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
      case "New":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100"
      case "Receiving":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
      case "Submitted":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100"
      case "Completed":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
      case "Rejected":
        return "bg-red-100 text-red-700 hover:bg-red-100"
      case "Cancelled":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
  }

  const canApprove = receiptData.status === "Submitted"
  const canReject = receiptData.status === "Submitted"
  const canCancel = ["Draft", "New", "Receiving"].includes(receiptData.status)

  return (
    <div className="flex gap-6 pb-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Goods Transfer Information Section */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-6">{t("goods_transfer_information")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Goods Receipt No */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("goods_receipt_no")}</Label>
                <Input value={receiptData.goodsReceiptNo} disabled className="mt-2 bg-muted" />
              </div>

              {/* Goods Receipt Type */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("goods_receipt_type")}</Label>
                <Input value={receiptData.goodsReceiptType} disabled className="mt-2 bg-muted" />
              </div>

              {/* Created By */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("created_by")}</Label>
                <Input value={receiptData.createdBy} disabled className="mt-2 bg-muted" />
              </div>

              {/* Reference No */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("ref_no")}</Label>
                <Input value={receiptData.refNo} disabled className="mt-2 bg-muted" />
              </div>

              {/* Document Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("doc_date")}</Label>
                <Input value={receiptData.docDate} disabled className="mt-2 bg-muted" />
              </div>

              {/* Created Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("created_date")}</Label>
                <Input value={receiptData.createdDate} disabled className="mt-2 bg-muted" />
              </div>

              {/* Expected Receipt Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("expected_receipt_date")}</Label>
                <Input value={receiptData.expectedReceiptDate} disabled className="mt-2 bg-muted" />
              </div>

              {/* Destination Warehouse */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("destination_warehouse")}</Label>
                <Input value={receiptData.destinationWarehouse} disabled className="mt-2 bg-muted" />
              </div>

              {/* Partner */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("partner")}</Label>
                <Input value={receiptData.partner} disabled className="mt-2 bg-muted" />
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("status")}</Label>
                <div className="mt-2">
                  <Badge className={getStatusBadgeClass(receiptData.status)}>{receiptData.status}</Badge>
                </div>
              </div>

              {/* Handler */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("handler")}</Label>
                <Input value={receiptData.handler} disabled className="mt-2 bg-muted" />
              </div>

              {/* Approved By */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("approved_by")}</Label>
                <Input value={receiptData.approvedBy || "-"} disabled className="mt-2 bg-muted" />
              </div>

              {/* Approved Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t("approved_date")}</Label>
                <Input value={receiptData.approvedDate || "-"} disabled className="mt-2 bg-muted" />
              </div>

              {/* Note - spans full width */}
              <div className="md:col-span-3">
                <Label className="text-sm font-medium text-muted-foreground">{t("note")}</Label>
                <Textarea value={receiptData.note} disabled className="mt-2 bg-muted" rows={4} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Lines Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("receipt_lines")}</h2>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("export")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[80px]">{t("line_no")}</TableHead>
                    <TableHead className="font-semibold">{t("model_asset")}</TableHead>
                    <TableHead className="font-semibold">{t("model_asset_name")}</TableHead>
                    <TableHead className="font-semibold">{t("tracking_type")}</TableHead>
                    <TableHead className="font-semibold">{t("unit")}</TableHead>
                    <TableHead className="text-right font-semibold">{t("planned_quantity")}</TableHead>
                    <TableHead className="text-right font-semibold">{t("quantity_entered")}</TableHead>
                    <TableHead className="text-right font-semibold">{t("diff_quantity")}</TableHead>
                    <TableHead className="font-semibold">{t("detail")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.lineNo}</TableCell>
                      <TableCell className="font-medium text-blue-600">{line.modelAsset}</TableCell>
                      <TableCell>{line.modelAssetName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            line.trackingType === "Serial"
                              ? "default"
                              : line.trackingType === "Lot"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {line.trackingType}
                        </Badge>
                      </TableCell>
                      <TableCell>{line.unit}</TableCell>
                      <TableCell className="text-right">{line.plannedQuantity}</TableCell>
                      <TableCell className="text-right">{line.quantityEntered}</TableCell>
                      <TableCell className="text-right">
                        <span className={line.diffQuantity !== 0 ? "text-orange-600 font-medium" : ""}>
                          {line.diffQuantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-600 p-0 h-auto"
                          onClick={() => handleViewLine(line)}
                        >
                          {t("view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total Items */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-sm">
                <span className="font-semibold">{t("total_item")}:</span>
                <span className="ml-4 text-lg font-bold">{getTotalItems()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="text-red-500 border-red-500 hover:bg-red-50 bg-transparent"
            onClick={handleBack}
          >
            {t("back")}
          </Button>

          <div className="flex gap-3">
            {canCancel && (
              <Button
                variant="outline"
                className="text-gray-700 border-gray-300 bg-transparent"
                onClick={() => setCancelDialogOpen(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                {t("cancel_receipt")}
              </Button>
            )}
            {canReject && (
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("reject")}
              </Button>
            )}
            {canApprove && (
              <Button
                variant="default"
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => setApproveDialogOpen(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t("approve")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-6">
        {/* Status History */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">{t("status_history")}</h3>
            {statusHistory.length > 0 ? (
              <div className="space-y-4">
                {statusHistory.map((history, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-3 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusBadgeClass(history.status)} variant="outline">
                        {history.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{history.timestamp}</p>
                    <p className="text-xs font-medium">{history.user}</p>
                    {history.note && <p className="text-xs text-muted-foreground mt-1">{history.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{t("no_status_history")}</div>
            )}
          </CardContent>
        </Card>

        {/* Destination Warehouse Info */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">{t("destination_warehouse")}</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{receiptData.destinationWarehouse}</p>
              <p className="text-muted-foreground">+(84) 0242 232 212</p>
              <p className="text-muted-foreground">Vũng Tàu, Việt Nam</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("approve_goods_receipt")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("approve_goods_receipt_confirmation")}
              <br />
              <strong>{receiptData.goodsReceiptNo}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-emerald-500 hover:bg-emerald-600">
              {t("approve")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reject_goods_receipt")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("reject_goods_receipt_confirmation")}
              <br />
              <strong>{receiptData.goodsReceiptNo}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              {t("reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancel_goods_receipt")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancel_goods_receipt_confirmation")}
              <br />
              <strong>{receiptData.goodsReceiptNo}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("back")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700">
              {t("cancel_receipt")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Line Detail Dialog */}
      {selectedLine && (
        <LineDetailDialog
          open={lineDialogOpen}
          onOpenChange={setLineDialogOpen}
          line={selectedLine}
          models={[]}
          onSave={() => {
            setLineDialogOpen(false)
          }}
          readOnly={true}
        />
      )}
    </div>
  )
}
