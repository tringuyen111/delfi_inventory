"use client"

import { useEffect, useMemo, useState } from "react"
import { MainLayout } from "./components/layout/MainLayout"
import { Dashboard } from "./pages/Dashboard"
import { StockOnhand } from "./pages/StockOnhand"
import { GoodsReceipt } from "./pages/GoodsReceipt"
import { CreateGoodsReceipt } from "./pages/CreateGoodsReceipt"
import { GoodsReceiptDetail } from "./pages/GoodsReceiptDetail"
import { GoodsIssue } from "./pages/GoodsIssue"
import { InventoryCount } from "./pages/InventoryCount"
import { GoodsTransfer } from "./pages/GoodsTransfer"
import { Putaway } from "./pages/Putaway"
import { UoM } from "./pages/UoM"
import { Partner } from "./pages/Partner"
import { Organization } from "./pages/Organization"
import { Branch } from "./pages/Branch"
import { Warehouse } from "./pages/Warehouse"
import { Location } from "./pages/Location"
import { GoodsType } from "./pages/GoodsType"
import { ModelGoods } from "./pages/ModelGoods"
import { Reports } from "./pages/Reports"
import { Authentication } from "./pages/Authentication"

type PageType =
  | "dashboard"
  | "stock-onhand"
  | "goods-receipt"
  | "create-goods-receipt"
  | "goods-receipt-detail"
  | "goods-issue"
  | "inventory-count"
  | "goods-transfer"
  | "putaway"
  | "uom"
  | "partner"
  | "organization"
  | "branch"
  | "warehouse"
  | "location"
  | "goods-type"
  | "model-goods"
  | "reports"
  | "authentication"

type Breadcrumb = { label: string; href?: string }

const HASH_TO_PAGE: Record<string, PageType> = {
  dashboard: "dashboard",
  "stock-onhand": "stock-onhand",
  "goods-receipt": "goods-receipt",
  "create-goods-receipt": "create-goods-receipt",
  "goods-receipt-detail": "goods-receipt-detail",
  "goods-issue": "goods-issue",
  "inventory-count": "inventory-count",
  "goods-transfer": "goods-transfer",
  putaway: "putaway",
  uom: "uom",
  partner: "partner",
  organization: "organization",
  branch: "branch",
  warehouse: "warehouse",
  location: "location",
  "goods-type": "goods-type",
  "model-goods": "model-goods",
  reports: "reports",
  authentication: "authentication",
}

const BREADCRUMBS: Record<PageType, Breadcrumb[]> = {
  dashboard: [{ label: "Dashboard" }],
  "stock-onhand": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Stock Onhand" },
  ],
  "goods-receipt": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Goods Receipt" },
  ],
  "create-goods-receipt": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Goods Receipt", href: "#goods-receipt" },
    { label: "Create" },
  ],
  "goods-receipt-detail": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Goods Receipt", href: "#goods-receipt" },
    { label: "Goods Receipt Details" },
  ],
  "goods-issue": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Goods Issue" },
  ],
  "inventory-count": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Inventory Count" },
  ],
  "goods-transfer": [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Goods Transfer" },
  ],
  putaway: [
    { label: "Home", href: "#dashboard" },
    { label: "Warehouse Operations" },
    { label: "Putaway" },
  ],
  uom: [
    { label: "Home", href: "#dashboard" },
    { label: "Master Data" },
    { label: "UoM" },
  ],
  partner: [
    { label: "Home", href: "#dashboard" },
    { label: "Master Data" },
    { label: "Partner" },
  ],
  organization: [
    { label: "Home", href: "#dashboard" },
    { label: "Master Data" },
    { label: "Organization" },
  ],
  branch: [
    { label: "Home", href: "#dashboard" },
    { label: "Master Data" },
    { label: "Branch" },
  ],
  warehouse: [
    { label: "Home", href: "#dashboard" },
    { label: "Master Data" },
    { label: "Warehouse" },
  ],
  location: [
    { label: "Home", href: "#dashboard" },
    { label: "Master Data" },
    { label: "Location" },
  ],
  "goods-type": [
    { label: "Home", href: "#dashboard" },
    { label: "Goods Management" },
    { label: "Goods Type" },
  ],
  "model-goods": [
    { label: "Home", href: "#dashboard" },
    { label: "Goods Management" },
    { label: "Model Goods" },
  ],
  reports: [
    { label: "Home", href: "#dashboard" },
    { label: "Reports" },
  ],
  authentication: [
    { label: "Home", href: "#dashboard" },
    { label: "Authentication" },
  ],
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      setCurrentPage(HASH_TO_PAGE[hash] ?? "dashboard")
    }

    handleHashChange()

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const breadcrumbs = useMemo(() => BREADCRUMBS[currentPage] ?? BREADCRUMBS.dashboard, [currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "stock-onhand":
        return <StockOnhand />
      case "goods-receipt":
        return <GoodsReceipt />
      case "create-goods-receipt":
        return <CreateGoodsReceipt />
      case "goods-receipt-detail":
        return <GoodsReceiptDetail />
      case "goods-issue":
        return <GoodsIssue />
      case "inventory-count":
        return <InventoryCount />
      case "goods-transfer":
        return <GoodsTransfer />
      case "putaway":
        return <Putaway />
      case "uom":
        return <UoM />
      case "partner":
        return <Partner />
      case "organization":
        return <Organization />
      case "branch":
        return <Branch />
      case "warehouse":
        return <Warehouse />
      case "location":
        return <Location />
      case "goods-type":
        return <GoodsType />
      case "model-goods":
        return <ModelGoods />
      case "reports":
        return <Reports />
      case "authentication":
        return <Authentication />
      default:
        return <Dashboard />
    }
  }

  return <MainLayout breadcrumbs={breadcrumbs}>{renderPage()}</MainLayout>
}
