"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { toast } from "sonner"
import { Plus, Trash2, Upload, Paperclip, X, AlertCircle } from "lucide-react"

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
  attachments?: File[]
}

interface Model {
  code: string
  name: string
  trackingType: "None" | "Serial" | "Lot"
  unit: string
}

interface LineDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  line: ReceiptLine
  models: Model[]
  onSave: (line: ReceiptLine) => void
  readOnly?: boolean
}

export function LineDetailDialog({
  open,
  onOpenChange,
  line,
  models,
  onSave,
  readOnly = false,
}: LineDetailDialogProps) {
  const { t } = useLanguage()
  const [editedLine, setEditedLine] = useState<ReceiptLine>(line)
  const [serialInput, setSerialInput] = useState("")
  const [newLot, setNewLot] = useState({
    lotNo: "",
    mfgDate: "",
    expDate: "",
    qty: 0,
  })

  useEffect(() => {
    setEditedLine(line)
  }, [line])

  const locations = [
    { value: "A-01-01", label: "A-01-01" },
    { value: "A-01-02", label: "A-01-02" },
    { value: "B-02-01", label: "B-02-01" },
  ]

  const handleModelChange = (modelCode: string) => {
    const model = models.find((m) => m.code === modelCode)
    if (model) {
      setEditedLine({
        ...editedLine,
        modelCode: model.code,
        modelName: model.name,
        trackingType: model.trackingType,
        unit: model.unit,
        serials: [],
        lots: [],
        qtyReceived: 0,
        diffQuantity: editedLine.qtyPlanned,
      })
    }
  }

  const handleAddSerial = () => {
    if (!serialInput.trim()) {
      toast.error(t("serial_cannot_be_empty"))
      return
    }

    const serials = editedLine.serials || []
    if (serials.includes(serialInput.trim())) {
      toast.error(t("serial_already_exists"))
      return
    }

    const newSerials = [...serials, serialInput.trim()]
    setEditedLine({
      ...editedLine,
      serials: newSerials,
      qtyReceived: newSerials.length,
      diffQuantity: editedLine.qtyPlanned - newSerials.length,
    })
    setSerialInput("")
  }

  const handleRemoveSerial = (serial: string) => {
    const newSerials = (editedLine.serials || []).filter((s) => s !== serial)
    setEditedLine({
      ...editedLine,
      serials: newSerials,
      qtyReceived: newSerials.length,
      diffQuantity: editedLine.qtyPlanned - newSerials.length,
    })
  }

  const handleBulkPasteSerials = () => {
    const input = prompt(t("paste_serials_one_per_line"))
    if (input) {
      const newSerials = input
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s)
      const existingSerials = editedLine.serials || []
      const uniqueSerials = [...new Set([...existingSerials, ...newSerials])]
      setEditedLine({
        ...editedLine,
        serials: uniqueSerials,
        qtyReceived: uniqueSerials.length,
        diffQuantity: editedLine.qtyPlanned - uniqueSerials.length,
      })
      toast.success(`${uniqueSerials.length - existingSerials.length} ${t("serials_added")}`)
    }
  }

  const handleAddLot = () => {
    if (!newLot.lotNo.trim()) {
      toast.error(t("lot_no_required"))
      return
    }
    if (newLot.qty <= 0) {
      toast.error(t("lot_qty_must_be_greater_than_zero"))
      return
    }

    const lots = editedLine.lots || []
    const newLots = [...lots, { ...newLot }]
    const totalLotQty = newLots.reduce((sum, lot) => sum + lot.qty, 0)

    setEditedLine({
      ...editedLine,
      lots: newLots,
      qtyReceived: totalLotQty,
      diffQuantity: editedLine.qtyPlanned - totalLotQty,
    })
    setNewLot({ lotNo: "", mfgDate: "", expDate: "", qty: 0 })
    toast.success(t("lot_added"))
  }

  const handleRemoveLot = (index: number) => {
    const newLots = (editedLine.lots || []).filter((_, i) => i !== index)
    const totalLotQty = newLots.reduce((sum, lot) => sum + lot.qty, 0)

    setEditedLine({
      ...editedLine,
      lots: newLots,
      qtyReceived: totalLotQty,
      diffQuantity: editedLine.qtyPlanned - totalLotQty,
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setEditedLine({
        ...editedLine,
        attachments: [...(editedLine.attachments || []), ...newFiles],
      })
      toast.success(`${newFiles.length} ${t("files_uploaded")}`)
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setEditedLine({
      ...editedLine,
      attachments: (editedLine.attachments || []).filter((_, i) => i !== index),
    })
  }

  const handleQtyChange = (qty: number) => {
    setEditedLine({
      ...editedLine,
      qtyPlanned: qty,
      qtyReceived: editedLine.trackingType === "None" ? qty : editedLine.qtyReceived,
      diffQuantity: editedLine.trackingType === "None" ? 0 : qty - editedLine.qtyReceived,
    })
  }

  const handleSave = () => {
    // Validation
    if (!editedLine.modelCode) {
      toast.error(t("item_required"))
      return
    }
    if (editedLine.qtyPlanned <= 0) {
      toast.error(t("qty_must_be_greater_than_zero"))
      return
    }

    if (editedLine.trackingType === "Serial") {
      const serialCount = (editedLine.serials || []).length
      if (serialCount !== editedLine.qtyPlanned) {
        toast.error(`${t("serial_count_must_match_qty")}: ${serialCount}/${editedLine.qtyPlanned}`)
        return
      }
    }

    if (editedLine.trackingType === "Lot") {
      const lots = editedLine.lots || []
      if (lots.length === 0) {
        toast.error(t("at_least_one_lot_required"))
        return
      }
      const totalLotQty = lots.reduce((sum, lot) => sum + lot.qty, 0)
      if (totalLotQty !== editedLine.qtyPlanned) {
        toast.error(`${t("lot_qty_must_match_total_qty")}: ${totalLotQty}/${editedLine.qtyPlanned}`)
        return
      }

      // Check expiry dates
      for (const lot of lots) {
        if (lot.expDate) {
          const expDate = new Date(lot.expDate)
          const today = new Date()
          if (expDate < today) {
            toast.error(`${t("lot")} ${lot.lotNo}: ${t("expiry_date_cannot_be_past")}`)
            return
          }
        }
      }
    }

    // Calculate amount if unit price is provided
    if (editedLine.unitPrice) {
      editedLine.amount = editedLine.unitPrice * editedLine.qtyPlanned
    }

    onSave(editedLine)
    toast.success(t("line_saved"))
  }

  const serialsCaptured = (editedLine.serials || []).length
  const serialsRequired = editedLine.qtyPlanned
  const lotsTotal = (editedLine.lots || []).reduce((sum, lot) => sum + lot.qty, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t("view_line") : editedLine.modelCode ? t("edit_line") : t("add_line")} - {t("line")} #
            {line.lineNo}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t("view_receipt_line_details") : t("edit_receipt_line_details")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="serial" disabled={editedLine.trackingType !== "Serial"} className="relative">
              {t("serial_manager")}
              {editedLine.trackingType === "Serial" && (
                <Badge variant={serialsCaptured === serialsRequired ? "default" : "destructive"} className="ml-2">
                  {serialsCaptured}/{serialsRequired}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="lot" disabled={editedLine.trackingType !== "Lot"} className="relative">
              {t("lot_manager")}
              {editedLine.trackingType === "Lot" && (
                <Badge variant={lotsTotal === editedLine.qtyPlanned ? "default" : "destructive"} className="ml-2">
                  {lotsTotal}/{editedLine.qtyPlanned}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attachments">{t("attachments")}</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Model */}
              <div className="md:col-span-2">
                <Label htmlFor="model">
                  {t("model")} <span className="text-destructive">*</span>
                </Label>
                {readOnly || editedLine.modelCode ? (
                  <Input
                    value={`${editedLine.modelCode} - ${editedLine.modelName}`}
                    disabled
                    className="mt-2 bg-muted"
                  />
                ) : (
                  <Select value={editedLine.modelCode} onValueChange={handleModelChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={t("select_model")} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.code} value={model.code}>
                          {model.code} - {model.name} ({model.trackingType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Tracking Type */}
              <div>
                <Label htmlFor="trackingType">{t("tracking_type")}</Label>
                <Input value={editedLine.trackingType} disabled className="mt-2 bg-muted" />
              </div>

              {/* Unit */}
              <div>
                <Label htmlFor="unit">{t("unit")}</Label>
                <Input value={editedLine.unit} disabled className="mt-2 bg-muted" />
              </div>

              {/* Qty Planned */}
              <div>
                <Label htmlFor="qtyPlanned">
                  {t("qty_planned")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="qtyPlanned"
                  type="number"
                  min="1"
                  value={editedLine.qtyPlanned}
                  onChange={(e) => handleQtyChange(Number(e.target.value))}
                  disabled={readOnly}
                  className="mt-2"
                />
              </div>

              {/* Qty Received */}
              <div>
                <Label htmlFor="qtyReceived">{t("qty_received")}</Label>
                <Input
                  id="qtyReceived"
                  type="number"
                  value={editedLine.qtyReceived}
                  disabled
                  className="mt-2 bg-muted"
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">{t("location")}</Label>
                <Select
                  value={editedLine.location}
                  onValueChange={(value) => setEditedLine({ ...editedLine, location: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("select_location")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Price */}
              <div>
                <Label htmlFor="unitPrice">
                  {t("unit_price")} <span className="text-muted-foreground">({t("optional")})</span>
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedLine.unitPrice || ""}
                  onChange={(e) => setEditedLine({ ...editedLine, unitPrice: Number(e.target.value) })}
                  disabled={readOnly}
                  className="mt-2"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <Label htmlFor="lineNotes">
                  {t("notes")} <span className="text-muted-foreground">({t("optional")})</span>
                </Label>
                <Textarea
                  id="lineNotes"
                  value={editedLine.notes || ""}
                  onChange={(e) => setEditedLine({ ...editedLine, notes: e.target.value })}
                  disabled={readOnly}
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          {/* Serial Manager Tab */}
          <TabsContent value="serial" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{t("serial_numbers")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("captured")}: {serialsCaptured} / {t("required")}: {serialsRequired}
                      </p>
                    </div>
                    {!readOnly && (
                      <Button variant="outline" size="sm" onClick={handleBulkPasteSerials}>
                        <Upload className="mr-2 h-4 w-4" />
                        {t("bulk_paste")}
                      </Button>
                    )}
                  </div>

                  {!readOnly && serialsCaptured < serialsRequired && (
                    <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {t("need_more_serials")}: {serialsRequired - serialsCaptured}
                      </span>
                    </div>
                  )}

                  {!readOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("enter_serial_number")}
                        value={serialInput}
                        onChange={(e) => setSerialInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddSerial()}
                      />
                      <Button onClick={handleAddSerial}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("add")}
                      </Button>
                    </div>
                  )}

                  {(editedLine.serials || []).length > 0 && (
                    <div className="max-h-[300px] overflow-y-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">#</TableHead>
                            <TableHead>{t("serial_no")}</TableHead>
                            {!readOnly && <TableHead className="w-[80px]">{t("actions")}</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(editedLine.serials || []).map((serial, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-mono">{serial}</TableCell>
                              {!readOnly && (
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveSerial(serial)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lot Manager Tab */}
          <TabsContent value="lot" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{t("lot_information")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("total_lot_qty")}: {lotsTotal} / {t("required")}: {editedLine.qtyPlanned}
                    </p>
                  </div>

                  {!readOnly && lotsTotal < editedLine.qtyPlanned && (
                    <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {t("need_more_lot_qty")}: {editedLine.qtyPlanned - lotsTotal}
                      </span>
                    </div>
                  )}

                  {!readOnly && (
                    <>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <Label htmlFor="lotNo">
                            {t("lot_no")} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="lotNo"
                            value={newLot.lotNo}
                            onChange={(e) => setNewLot({ ...newLot, lotNo: e.target.value })}
                            placeholder={t("enter_lot_number")}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mfgDate">{t("mfg_date")}</Label>
                          <Input
                            id="mfgDate"
                            type="date"
                            value={newLot.mfgDate}
                            onChange={(e) => setNewLot({ ...newLot, mfgDate: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expDate">{t("exp_date")}</Label>
                          <Input
                            id="expDate"
                            type="date"
                            value={newLot.expDate}
                            onChange={(e) => setNewLot({ ...newLot, expDate: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lotQty">
                            {t("qty")} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="lotQty"
                            type="number"
                            min="1"
                            value={newLot.qty || ""}
                            onChange={(e) => setNewLot({ ...newLot, qty: Number(e.target.value) })}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <Button onClick={handleAddLot} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("add_lot")}
                      </Button>
                    </>
                  )}

                  {(editedLine.lots || []).length > 0 && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("lot_no")}</TableHead>
                            <TableHead>{t("mfg_date")}</TableHead>
                            <TableHead>{t("exp_date")}</TableHead>
                            <TableHead className="text-right">{t("qty")}</TableHead>
                            {!readOnly && <TableHead className="w-[80px]">{t("actions")}</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(editedLine.lots || []).map((lot, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{lot.lotNo}</TableCell>
                              <TableCell>{lot.mfgDate || "-"}</TableCell>
                              <TableCell>
                                {lot.expDate ? (
                                  <div className="flex items-center gap-2">
                                    {lot.expDate}
                                    {new Date(lot.expDate) < new Date() && (
                                      <Badge variant="destructive">{t("expired")}</Badge>
                                    )}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-right">{lot.qty}</TableCell>
                              {!readOnly && (
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveLot(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{t("line_attachments")}</h3>
                    <p className="text-sm text-muted-foreground">{t("attach_files_to_this_line")}</p>
                  </div>

                  {!readOnly && (
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="line-file-upload" className="cursor-pointer">
                        <Paperclip className="mr-2 h-4 w-4" />
                        {t("upload_files")}
                        <input
                          id="line-file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                  )}

                  {(editedLine.attachments || []).length > 0 ? (
                    <div className="space-y-2">
                      {(editedLine.attachments || []).map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                          </div>
                          {!readOnly && (
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveAttachment(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">{t("no_attachments_yet")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
          {!readOnly && <Button onClick={handleSave}>{t("save_line")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
