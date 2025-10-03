"use client"
import { useState, useMemo } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { toast } from "sonner"
import { Upload, Download, Plus, Trash2, Edit } from "lucide-react"
import { LineDetailDialog } from "../components/LineDetailDialog"
import { InlineModelSearch } from "../components/InlineModelSearch"

interface ReceiptLine {
  id: string
  lineNo: number
  modelCode: string
  modelName: string
  trackingType: "None" | "Serial" | "Lot"
  unit: string
  qtyPlanned: number
  qtyReceived: number
  diffQuantity: number
  onhand?: number
  location?: string
  unitPrice?: number
  amount?: number
  notes?: string
  serials?: string[]
  lots?: Array<{
    lotNo: string
    mfgDate?: string
    expDate?: string
    qty: number
  }>
}

interface FormData {
  receiptNo: string
  receiptType: string
  refNo: string
  docDate: string
  expectedDate: string
  destinationWarehouse: string
  partner: string
  note: string
  status: "Draft" | "New" | "Receiving" | "Submitted" | "Completed" | "Rejected" | "Cancelled"
}

export function CreateGoodsReceipt() {
  const { t } = useLanguage()

  const [formData, setFormData] = useState<FormData>({
    receiptNo: "",
    receiptType: "PO",
    refNo: "",
    docDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    destinationWarehouse: "",
    partner: "",
    note: "",
    status: "Draft",
  })

  const [lines, setLines] = useState<ReceiptLine[]>([])
  const [selectedLine, setSelectedLine] = useState<ReceiptLine | null>(null)
  const [lineDialogOpen, setLineDialogOpen] = useState(false)

  // Mock data for dropdowns
  const receiptTypes = [
    { value: "PO", label: "Receipt by PO" },
    { value: "Transfer", label: "Receipt by Transfer" },
    { value: "Return", label: "Receipt by Return" },
    { value: "Manual", label: "Receipt Manual" },
  ]

  const warehouses = [
    { value: "WH001", label: "Kho Vũng Tàu", active: true },
    { value: "WH002", label: "Kho Hà Nội", active: true },
    { value: "WH003", label: "Kho Đà Nẵng", active: false },
  ]

  const partners = [
    { value: "SUPP001", label: "Supplier Dep trai" },
    { value: "SUPP002", label: "Supplier ABC" },
    { value: "SUPP003", label: "Supplier XYZ" },
  ]

  const models = [
    { code: "LAP001", name: "Dell Laptop Inspiron 15", trackingType: "Serial" as const, unit: "PCS", onhand: 150 },
    { code: "LAP002", name: "COMPRESSOR FH2588-5W", trackingType: "Serial" as const, unit: "PCS", onhand: 200 },
    { code: "LAP003", name: "COMPRESSOR BA-74432", trackingType: "Lot" as const, unit: "PCS", onhand: 75 },
    { code: "LAP004", name: "DOOR_GASKET_485X878", trackingType: "Serial" as const, unit: "PCS", onhand: 300 },
    {
      code: "LAP005",
      name: "DOOR PROC. BLUE LETG/TG CAC-0123E11A",
      trackingType: "Lot" as const,
      unit: "PCS",
      onhand: 120,
    },
    { code: "LAP006", name: "DOOR GASKET 513X1295", trackingType: "Serial" as const, unit: "PCS", onhand: 180 },
    { code: "LAP007", name: "MOTOR_EBM_5W_M4Q045BD01-83", trackingType: "Serial" as const, unit: "PCS", onhand: 90 },
    {
      code: "LAP008",
      name: "CAPACITOR 40MFD-370VAC MARK VDE",
      trackingType: "None" as const,
      unit: "PCS",
      onhand: 500,
    },
  ]

  const validateForm = (isDraft = false): boolean => {
    // Basic validation
    if (!formData.destinationWarehouse) {
      toast.error(t("destination_warehouse_required"))
      return false
    }

    // Check if warehouse is active
    const warehouse = warehouses.find((w) => w.value === formData.destinationWarehouse)
    if (!warehouse?.active) {
      toast.error(t("warehouse_not_active"))
      return false
    }

    // PO/Transfer requires ref_no
    if ((formData.receiptType === "PO" || formData.receiptType === "Transfer") && !formData.refNo.trim()) {
      toast.error(t("ref_no_required_for_po_transfer"))
      return false
    }

    // If not draft, require at least one line
    if (!isDraft && lines.length === 0) {
      toast.error(t("at_least_one_line_required"))
      return false
    }

    // Validate lines
    for (const line of lines) {
      if (line.qtyPlanned <= 0) {
        toast.error(`${t("line")} ${line.lineNo}: ${t("qty_must_be_greater_than_zero")}`)
        return false
      }

      // Validate tracking requirements
      if (line.trackingType === "Serial") {
        const serialCount = (line.serials || []).length
        if (serialCount !== line.qtyReceived && line.qtyReceived > 0) {
          toast.error(`${t("line")} ${line.lineNo}: ${t("serial_count_must_match_qty")}`)
          return false
        }
      }

      if (line.trackingType === "Lot") {
        const lots = line.lots || []
        if (lots.length > 0) {
          const totalLotQty = lots.reduce((sum, lot) => sum + lot.qty, 0)
          if (totalLotQty !== line.qtyReceived && line.qtyReceived > 0) {
            toast.error(`${t("line")} ${line.lineNo}: ${t("lot_qty_must_match_total_qty")}`)
            return false
          }
        }
      }
    }

    return true
  }

  const handleSave = () => {
    if (!validateForm(true)) {
      return
    }

    // Generate receipt number if not exists
    if (!formData.receiptNo) {
      const receiptNo = `GR${Date.now().toString().slice(-8)}`
      setFormData({ ...formData, receiptNo, status: "Draft" })
    }

    console.log("[v0] Saving as Draft:", { formData, lines })
    toast.success(t("goods_receipt_saved_as_draft"))
  }

  const handleCreate = () => {
    if (!validateForm(false)) {
      return
    }

    // Generate receipt number if not exists
    const receiptNo = formData.receiptNo || `GR${Date.now().toString().slice(-8)}`
    const updatedFormData = { ...formData, receiptNo, status: "New" as const }

    console.log("[v0] Creating Goods Receipt:", { formData: updatedFormData, lines })
    toast.success(t("goods_receipt_created"))

    // Navigate to detail view
    setTimeout(() => {
      window.location.hash = `goods-receipt-detail?id=${receiptNo}`
    }, 500)
  }

  const handleCancel = () => {
    window.location.hash = "goods-receipt"
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,.xlsx,.xls"
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("[v0] Importing file:", file.name)
        // Mock import - in real app, parse CSV/Excel
        toast.success(t("import_successful"))

        // Add sample imported lines
        const importedLines: ReceiptLine[] = models.slice(0, 3).map((model, index) => ({
          id: `line-${Date.now()}-${index}`,
          lineNo: lines.length + index + 1,
          modelCode: model.code,
          modelName: model.name,
          trackingType: model.trackingType,
          unit: model.unit,
          qtyPlanned: 100,
          qtyReceived: 0,
          diffQuantity: 100,
          onhand: model.onhand,
        }))

        setLines([...lines, ...importedLines])
      }
    }
    input.click()
  }

  const handleExport = () => {
    if (lines.length === 0) {
      toast.error(t("no_data_to_export"))
      return
    }

    // Mock export - in real app, generate CSV/Excel
    const csvContent = [
      ["Line No", "Model Code", "Model Name", "Tracking Type", "Unit", "Qty Planned"].join(","),
      ...lines.map((line) =>
        [line.lineNo, line.modelCode, line.modelName, line.trackingType, line.unit, line.qtyPlanned].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `GR_${formData.receiptNo || "draft"}_${Date.now()}.csv`
    a.click()

    toast.success(t("export_successful"))
  }

  const handleAddLine = () => {
    const newLine: ReceiptLine = {
      id: `line-${Date.now()}`,
      lineNo: lines.length + 1,
      modelCode: "",
      modelName: "",
      trackingType: "None",
      unit: "PCS",
      qtyPlanned: 1,
      qtyReceived: 0,
      diffQuantity: 1,
      onhand: undefined,
    }
    setLines([...lines, newLine])
  }

  const handleEditLine = (line: ReceiptLine) => {
    if (!line.modelCode) {
      toast.error(t("item_required"))
      return
    }
    setSelectedLine(line)
    setLineDialogOpen(true)
  }

  const handleDeleteLine = (lineId: string) => {
    setLines(lines.filter((l) => l.id !== lineId))
    toast.success(t("line_deleted"))
  }

  const handleSaveLine = (line: ReceiptLine) => {
    if (lines.find((l) => l.id === line.id)) {
      // Update existing line
      setLines(lines.map((l) => (l.id === line.id ? line : l)))
    } else {
      // Add new line
      setLines([...lines, line])
    }

    // Calculate diff quantity
    const updatedLine = {
      ...line,
      diffQuantity: line.qtyPlanned - line.qtyReceived,
    }

    setLines(lines.map((l) => (l.id === updatedLine.id ? updatedLine : l)))
    setLineDialogOpen(false)
  }

  const handleSelectModel = (lineId: string, model: (typeof models)[0]) => {
    setLines((prevLines) =>
      prevLines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              modelCode: model.code,
              modelName: model.name,
              trackingType: model.trackingType,
              unit: model.unit,
              onhand: model.onhand,
            }
          : line,
      ),
    )
  }

  const handleQtyChange = (lineId: string, value: string) => {
    const qty = Number.parseInt(value, 10)
    const line = lines.find((l) => l.id === lineId)

    if (line && line.onhand !== undefined && !isNaN(qty) && qty > line.onhand) {
      toast.error(t("qty_exceeds_onhand"))
      return
    }

    setLines((prevLines) =>
      prevLines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              qtyPlanned: isNaN(qty) ? 0 : qty,
            }
          : line,
      ),
    )
  }

  const getTotalItems = () => {
    return lines.reduce((sum, line) => sum + line.qtyPlanned, 0)
  }

  const isAddLineDisabled = useMemo(() => {
    if (!formData.destinationWarehouse) return true
    if ((formData.receiptType === "PO" || formData.receiptType === "Transfer") && !formData.refNo.trim()) return true
    return false
  }, [formData.receiptType, formData.refNo, formData.destinationWarehouse])

  return (
    <div className="space-y-6 pb-8">
      {/* Information Section */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-6">{t("information")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Goods Receipt No */}
            <div>
              <Label htmlFor="receiptNo" className="text-sm font-medium">
                {t("goods_receipt_no")}
              </Label>
              <Input
                id="receiptNo"
                value={formData.receiptNo}
                placeholder={t("auto_generated")}
                disabled
                className="mt-2 bg-muted"
              />
            </div>

            {/* Goods Receipt Type */}
            <div>
              <Label htmlFor="receiptType" className="text-sm font-medium">
                {t("goods_receipt_type")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.receiptType}
                onValueChange={(value) => setFormData({ ...formData, receiptType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {receiptTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Date */}
            <div>
              <Label htmlFor="docDate" className="text-sm font-medium">
                {t("doc_date")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="docDate"
                type="date"
                value={formData.docDate}
                onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Reference No */}
            <div>
              <Label htmlFor="refNo" className="text-sm font-medium">
                {t("ref_no")}
                {(formData.receiptType === "PO" || formData.receiptType === "Transfer") && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              <Input
                id="refNo"
                value={formData.refNo}
                onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                placeholder={t("enter_reference_number")}
                className="mt-2"
              />
            </div>

            {/* Expected Receipt Date */}
            <div>
              <Label htmlFor="expectedDate" className="text-sm font-medium">
                {t("expected_receipt_date")}
              </Label>
              <Input
                id="expectedDate"
                type="date"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Destination Warehouse */}
            <div>
              <Label htmlFor="destinationWarehouse" className="text-sm font-medium">
                {t("destination_warehouse")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.destinationWarehouse}
                onValueChange={(value) => setFormData({ ...formData, destinationWarehouse: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t("select_warehouse")} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses
                    .filter((w) => w.active)
                    .map((warehouse) => (
                      <SelectItem key={warehouse.value} value={warehouse.value}>
                        {warehouse.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Partner */}
            <div>
              <Label htmlFor="partner" className="text-sm font-medium">
                {t("partner")}
              </Label>
              <Select value={formData.partner} onValueChange={(value) => setFormData({ ...formData, partner: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t("select_partner")} />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.value} value={partner.value}>
                      {partner.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note - spans full width */}
            <div className="md:col-span-3">
              <Label htmlFor="note" className="text-sm font-medium">
                {t("note")}
              </Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder={t("enter_note")}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Plan Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("receipt_plan")}</h2>
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="bg-cyan-500 hover:bg-cyan-600" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                {t("import")}
              </Button>
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
          </div>

          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-[70px]">{t("line_no")}</TableHead>
                  <TableHead className="font-semibold w-[180px]">{t("model_goods")}</TableHead>
                  <TableHead className="font-semibold min-w-[280px]">{t("model_goods_name")}</TableHead>
                  <TableHead className="font-semibold w-[120px]">{t("tracking_type")}</TableHead>
                  <TableHead className="font-semibold w-[80px]">{t("unit")}</TableHead>
                  <TableHead className="text-right font-semibold w-[100px]">{t("onhand")}</TableHead>
                  <TableHead className="text-right font-semibold w-[120px]">{t("qty_planned")}</TableHead>
                  <TableHead className="font-semibold w-[100px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      {t("no_receipt_lines")}
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.lineNo}</TableCell>
                      <TableCell>
                        {line.modelCode ? (
                          <span className="font-semibold text-blue-600">{line.modelCode}</span>
                        ) : (
                          <InlineModelSearch models={models} onSelect={(model) => handleSelectModel(line.id, model)} />
                        )}
                      </TableCell>
                      <TableCell>
                        {line.modelCode ? (
                          <span className="text-sm">{line.modelName}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {line.modelCode ? (
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
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{line.modelCode ? line.unit : "-"}</TableCell>
                      <TableCell className="text-right">
                        {line.modelCode && line.onhand !== undefined ? (
                          <span className="font-medium text-gray-700">{line.onhand}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={line.qtyPlanned || ""}
                          onChange={(e) => handleQtyChange(line.id, e.target.value)}
                          disabled={!line.modelCode}
                          className="w-24 text-right"
                          min="1"
                          max={line.onhand}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLine(line)}
                            className="h-8 px-2"
                            disabled={!line.modelCode}
                            title={line.modelCode ? t("edit_details") : t("select_model_first")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLine(line.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleAddLine}
              disabled={isAddLineDisabled}
              title={isAddLineDisabled ? t("fill_required_fields_first") : t("add_line")}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("add_line")}
            </Button>
          </div>

          {/* Total Items */}
          {lines.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-sm">
                <span className="font-semibold">{t("total_item")}:</span>
                <span className="ml-4 text-lg font-bold">{getTotalItems()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="text-red-500 border-red-500 hover:bg-red-50 bg-transparent"
          onClick={handleCancel}
        >
          {t("cancel")}
        </Button>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          {t("save")}
        </Button>
        <Button variant="default" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleCreate}>
          {t("create")}
        </Button>
      </div>

      {selectedLine && (
        <LineDetailDialog
          open={lineDialogOpen}
          onOpenChange={setLineDialogOpen}
          line={selectedLine}
          models={models}
          onSave={handleSaveLine}
        />
      )}
    </div>
  )
}
