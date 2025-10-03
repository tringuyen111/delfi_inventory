"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "./components/layout/MainLayout"
import { Dashboard } from "./pages/Dashboard"
import { StockOnhand } from "./pages/StockOnhand"
import { UoM } from "./pages/UoM"
import { Partner } from "./pages/Partner"
import { Organization } from "./pages/Organization"
import { Branch } from "./pages/Branch"
import { Warehouse } from "./pages/Warehouse"
import { Location } from "./pages/Location"
import { GoodsType } from "./pages/GoodsType"
import { ModelGoods } from "./pages/ModelGoods"
import { GoodsReceipt } from "./pages/GoodsReceipt"
import { CreateGoodsReceipt } from "./pages/CreateGoodsReceipt"
import { GoodsReceiptDetail } from "./pages/GoodsReceiptDetail"

type PageType =
  | "dashboard"
  | "stock-onhand"
  | "goods-receipt"
  | "create-goods-receipt"
  | "goods-receipt-detail"
  | "uom"
  | "partner"
  | "organization"
  | "branch"
  | "warehouse"
  | "location"
  | "goods-type"
  | "model-goods"

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  // Listen to hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === "stock-onhand") {
        setCurrentPage("stock-onhand")
      } else if (hash === "goods-receipt") {
        setCurrentPage("goods-receipt")
      } else if (hash === "create-goods-receipt") {
        setCurrentPage("create-goods-receipt")
      } else if (hash === "goods-receipt-detail") {
        setCurrentPage("goods-receipt-detail")
      } else if (hash === "uom") {
        setCurrentPage("uom")
      } else if (hash === "partner") {
        setCurrentPage("partner")
      } else if (hash === "organization") {
        setCurrentPage("organization")
      } else if (hash === "branch") {
        setCurrentPage("branch")
      } else if (hash === "warehouse") {
        setCurrentPage("warehouse")
      } else if (hash === "location") {
        setCurrentPage("location")
      } else if (hash === "goods-type") {
        setCurrentPage("goods-type")
      } else if (hash === "model-goods") {
        setCurrentPage("model-goods")
      } else {
        setCurrentPage("dashboard")
      }
    }

    // Set initial page based on hash
    handleHashChange()

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const getBreadcrumbs = () => {
    switch (currentPage) {
      case "stock-onhand":
        return [{ label: "Home", href: "#dashboard" }, { label: "Warehouse Operations" }, { label: "Stock Onhand" }]
      case "goods-receipt":
        return [{ label: "Home", href: "#dashboard" }, { label: "Warehouse Operations" }, { label: "Goods Receipt" }]
      case "create-goods-receipt":
        return [
          { label: "Home", href: "#dashboard" },
          { label: "Warehouse Operations" },
          { label: "Goods Receipt", href: "#goods-receipt" },
          { label: "Create" },
        ]
      case "goods-receipt-detail":
        return [
          { label: "Home", href: "#dashboard" },
          { label: "Warehouse Operations" },
          { label: "Goods Receipt", href: "#goods-receipt" },
          { label: "Goods Receipt Details" },
        ]
      case "uom":
        return [{ label: "Home", href: "#dashboard" }, { label: "Master Data" }, { label: "UoM" }]
      case "partner":
        return [{ label: "Home", href: "#dashboard" }, { label: "Master Data" }, { label: "Partner" }]
      case "organization":
        return [{ label: "Home", href: "#dashboard" }, { label: "Master Data" }, { label: "Organization" }]
      case "branch":
        return [{ label: "Home", href: "#dashboard" }, { label: "Master Data" }, { label: "Branch" }]
      case "warehouse":
        return [{ label: "Home", href: "#dashboard" }, { label: "Master Data" }, { label: "Warehouse" }]
      case "location":
        return [{ label: "Home", href: "#dashboard" }, { label: "Master Data" }, { label: "Location" }]
      case "goods-type":
        return [{ label: "Home", href: "#dashboard" }, { label: "Goods Management" }, { label: "Goods Type" }]
      case "model-goods":
        return [{ label: "Home", href: "#dashboard" }, { label: "Goods Management" }, { label: "Model Goods" }]
      default:
        return [{ label: "Dashboard" }]
    }
  }

  return (
    <MainLayout breadcrumbs={getBreadcrumbs()}>
      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "stock-onhand" && <StockOnhand />}
      {currentPage === "goods-receipt" && <GoodsReceipt />}
      {currentPage === "create-goods-receipt" && <CreateGoodsReceipt />}
      {currentPage === "goods-receipt-detail" && <GoodsReceiptDetail />}
      {currentPage === "uom" && <UoM />}
      {currentPage === "partner" && <Partner />}
      {currentPage === "organization" && <Organization />}
      {currentPage === "branch" && <Branch />}
      {currentPage === "warehouse" && <Warehouse />}
      {currentPage === "location" && <Location />}
      {currentPage === "goods-type" && <GoodsType />}
      {currentPage === "model-goods" && <ModelGoods />}
    </MainLayout>
  )
}
