import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { MultiSelect } from '../components/ui/multi-select';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  AlertTriangle,
  Clock,
  XCircle,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  X,
  Columns3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner@2.0.3';

// Types
interface StockOnhandItem {
  id: string;
  organization: string;
  branch: string;
  warehouse: string;
  location: string;
  itemCode: string;
  itemName: string;
  goodsType: string;
  tracking: 'None' | 'Serial' | 'Lot';
  displayUoM: string;
  qtyOnhand: number;
  qtyAllocated: number;
  qtyAvailable: number;
  lastMovementAt: string;
  status: 'Active' | 'Inactive';
  badges: string[];
  serialNumbers?: SerialNumber[];
  lots?: LotNumber[];
}

interface SerialNumber {
  serialNo: string;
  status: 'Available' | 'Hold' | 'Blocked';
  onhand: number;
  receivedAt: string;
  receivedBy: string;
  lastMovementAt: string;
  lastMovementBy: string;
  notes: string;
}

interface LotNumber {
  lotNo: string;
  qtyOnhand: number;
  qtyAllocated: number;
  qtyAvailable: number;
  mfgDate: string;
  expDate: string;
  status: 'Available' | 'Hold' | 'Blocked';
  lastMovementAt: string;
  lastMovementBy: string;
  notes: string;
  badges: string[];
}

interface StockMovement {
  id: string;
  movementAt: string;
  docType: string;
  refNo: string;
  inQty: number;
  outQty: number;
  balance: number;
  serialLot: string;
  locFromTo: string;
  performedBy: string;
  notes: string;
}

export function StockOnhand() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Modals
  const [drilldownItem, setDrilldownItem] = useState<StockOnhandItem | null>(null);
  const [selectedSerial, setSelectedSerial] = useState<{ item: StockOnhandItem; serial: SerialNumber } | null>(null);
  const [selectedLot, setSelectedLot] = useState<{ item: StockOnhandItem; lot: LotNumber } | null>(null);
  const [stockCardItem, setStockCardItem] = useState<StockOnhandItem | null>(null);
  const [stockCardFilter, setStockCardFilter] = useState<{ type: 'serial' | 'lot' | 'all'; value: string }>({ type: 'all', value: '' });
  
  // Collapsible sections in drilldown
  const [serialsOpen, setSerialsOpen] = useState(true);
  const [lotsOpen, setLotsOpen] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    organization: 'all',
    branch: 'all',
    warehouse: 'all',
    location: 'all',
    goodsType: 'all',
    tracking: 'all',
    activeOnly: true,
    displayUoM: 'all',
    hasNegative: false,
  });

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'organization',
    'branch',
    'warehouse',
    'location',
    'itemCode',
    'itemName',
    'goodsType',
    'tracking',
    'uom',
    'onhand',
    'allocated',
    'available',
    'lastMovement',
  ]);

  const columnOptions = [
    { value: 'organization', label: t('organization') },
    { value: 'branch', label: t('branch') },
    { value: 'warehouse', label: t('warehouse') },
    { value: 'location', label: t('location') },
    { value: 'itemCode', label: t('item_code') },
    { value: 'itemName', label: t('item_name') },
    { value: 'goodsType', label: t('goods_type') },
    { value: 'tracking', label: t('tracking') },
    { value: 'uom', label: t('uom_base') },
    { value: 'onhand', label: t('onhand') },
    { value: 'allocated', label: t('allocated') },
    { value: 'available', label: t('available') },
    { value: 'lastMovement', label: t('last_movement') },
  ];

  // Inline filters for Serial section
  const [serialFilters, setSerialFilters] = useState({
    contains: '',
    receivedRange: { from: '', to: '' },
    status: [] as string[],
  });

  // Inline filters for Lot section
  const [lotFilters, setLotFilters] = useState({
    lotNo: '',
    mfgRange: { from: '', to: '' },
    expRange: { from: '', to: '' },
    nearExpiry: false,
  });

  // Mock data for filters with hierarchy
  const organizationOptions = [
    { value: 'Delfi Corporation', label: 'Delfi Corporation' },
    { value: 'Tech Solutions Ltd', label: 'Tech Solutions Ltd' },
  ];

  // Branch data with organization dependency
  const allBranchOptions: { value: string; label: string; organization: string }[] = [
    { value: 'HQ Branch', label: 'HQ Branch', organization: 'Delfi Corporation' },
    { value: 'North Branch', label: 'North Branch', organization: 'Delfi Corporation' },
    { value: 'South Branch', label: 'South Branch', organization: 'Tech Solutions Ltd' },
    { value: 'East Branch', label: 'East Branch', organization: 'Tech Solutions Ltd' },
  ];

  // Warehouse data with branch dependency
  const allWarehouseOptions: { value: string; label: string; branch: string }[] = [
    { value: 'Main Warehouse', label: 'Main Warehouse', branch: 'HQ Branch' },
    { value: 'Distribution Center', label: 'Distribution Center', branch: 'HQ Branch' },
    { value: 'North Warehouse', label: 'North Warehouse', branch: 'North Branch' },
    { value: 'South Warehouse', label: 'South Warehouse', branch: 'South Branch' },
    { value: 'East Warehouse', label: 'East Warehouse', branch: 'East Branch' },
  ];

  // Get available branches based on selected organization
  const availableBranches = filters.organization === 'all' 
    ? allBranchOptions 
    : allBranchOptions.filter(b => b.organization === filters.organization);

  // Get available warehouses based on selected branch
  const availableWarehouses = filters.branch === 'all'
    ? allWarehouseOptions
    : allWarehouseOptions.filter(w => w.branch === filters.branch);

  const locationOptions = [
    { value: 'A-01-01', label: 'A-01-01' },
    { value: 'A-01-02', label: 'A-01-02' },
    { value: 'A-02-01', label: 'A-02-01' },
    { value: 'B-01-01', label: 'B-01-01' },
    { value: 'C-01-01', label: 'C-01-01' },
  ];

  const goodsTypeOptions = [
    { value: 'FG', label: 'FG - Finished Goods' },
    { value: 'RM', label: 'RM - Raw Material' },
    { value: 'WIP', label: 'WIP - Work In Progress' },
    { value: 'SFG', label: 'SFG - Semi-Finished Goods' },
  ];

  const trackingOptions = [
    { value: 'None', label: t('tracking_none') },
    { value: 'Serial', label: t('tracking_serial') },
    { value: 'Lot', label: t('tracking_lot') },
  ];

  const statusOptions = [
    { value: 'Available', label: t('available_status') },
    { value: 'Hold', label: t('hold') },
    { value: 'Blocked', label: t('blocked') },
  ];

  // Mock stock onhand data
  const [stockData] = useState<StockOnhandItem[]>([
    {
      id: '1',
      organization: 'Delfi Corporation',
      branch: 'HQ Branch',
      warehouse: 'Main Warehouse',
      location: 'A-01-01',
      itemCode: 'LAPTOP-DEL-001',
      itemName: 'Dell Latitude 5420 Laptop',
      goodsType: 'FG',
      tracking: 'Serial',
      displayUoM: 'PC',
      qtyOnhand: 15,
      qtyAllocated: 3,
      qtyAvailable: 12,
      lastMovementAt: '2025-01-28 14:30',
      status: 'Active',
      badges: [],
      serialNumbers: [
        {
          serialNo: 'SN-LAPTOP-001',
          status: 'Available',
          onhand: 1,
          receivedAt: '2025-01-15',
          receivedBy: 'John Doe',
          lastMovementAt: '2025-01-15 09:00',
          lastMovementBy: 'John Doe',
          notes: 'New stock from supplier ABC',
        },
        {
          serialNo: 'SN-LAPTOP-002',
          status: 'Available',
          onhand: 1,
          receivedAt: '2025-01-15',
          receivedBy: 'John Doe',
          lastMovementAt: '2025-01-15 09:00',
          lastMovementBy: 'John Doe',
          notes: '',
        },
        {
          serialNo: 'SN-LAPTOP-003',
          status: 'Hold',
          onhand: 1,
          receivedAt: '2025-01-20',
          receivedBy: 'Jane Smith',
          lastMovementAt: '2025-01-28 10:00',
          lastMovementBy: 'Admin User',
          notes: 'Reserved for project X',
        },
        {
          serialNo: 'SN-LAPTOP-004',
          status: 'Available',
          onhand: 1,
          receivedAt: '2025-01-20',
          receivedBy: 'Jane Smith',
          lastMovementAt: '2025-01-20 14:30',
          lastMovementBy: 'Jane Smith',
          notes: '',
        },
        {
          serialNo: 'SN-LAPTOP-005',
          status: 'Available',
          onhand: 1,
          receivedAt: '2025-01-22',
          receivedBy: 'Mike Johnson',
          lastMovementAt: '2025-01-22 11:20',
          lastMovementBy: 'Mike Johnson',
          notes: '',
        },
      ],
    },
    {
      id: '2',
      organization: 'Delfi Corporation',
      branch: 'HQ Branch',
      warehouse: 'Main Warehouse',
      location: 'A-01-02',
      itemCode: 'MED-PARACETAMOL',
      itemName: 'Paracetamol 500mg',
      goodsType: 'FG',
      tracking: 'Lot',
      displayUoM: 'BOX',
      qtyOnhand: 500,
      qtyAllocated: 100,
      qtyAvailable: 400,
      lastMovementAt: '2025-01-27 16:45',
      status: 'Active',
      badges: ['near_expiry'],
      lots: [
        {
          lotNo: 'LOT-2024-12-001',
          qtyOnhand: 200,
          qtyAllocated: 50,
          qtyAvailable: 150,
          mfgDate: '2024-12-01',
          expDate: '2025-02-15',
          status: 'Available',
          lastMovementAt: '2025-01-20 10:00',
          lastMovementBy: 'Pharmacy Team',
          notes: 'First batch',
          badges: ['near_expiry'],
        },
        {
          lotNo: 'LOT-2025-01-001',
          qtyOnhand: 300,
          qtyAllocated: 50,
          qtyAvailable: 250,
          mfgDate: '2025-01-01',
          expDate: '2025-06-30',
          status: 'Available',
          lastMovementAt: '2025-01-27 16:45',
          lastMovementBy: 'Warehouse Team',
          notes: 'Fresh stock',
          badges: [],
        },
      ],
    },
    {
      id: '3',
      organization: 'Delfi Corporation',
      branch: 'North Branch',
      warehouse: 'North Warehouse',
      location: 'B-01-01',
      itemCode: 'MOUSE-LOG-001',
      itemName: 'Logitech MX Master 3',
      goodsType: 'FG',
      tracking: 'None',
      displayUoM: 'PC',
      qtyOnhand: 8,
      qtyAllocated: 0,
      qtyAvailable: 8,
      lastMovementAt: '2025-01-25 11:20',
      status: 'Active',
      badges: ['low_stock'],
    },
    {
      id: '4',
      organization: 'Delfi Corporation',
      branch: 'HQ Branch',
      warehouse: 'Main Warehouse',
      location: 'C-01-01',
      itemCode: 'CHEM-ACID-001',
      itemName: 'Hydrochloric Acid 37%',
      goodsType: 'RM',
      tracking: 'Lot',
      displayUoM: 'L',
      qtyOnhand: -5,
      qtyAllocated: 0,
      qtyAvailable: -5,
      lastMovementAt: '2025-01-26 09:15',
      status: 'Active',
      badges: ['negative_stock'],
      lots: [
        {
          lotNo: 'LOT-ACID-2024-Q4',
          qtyOnhand: -5,
          qtyAllocated: 0,
          qtyAvailable: -5,
          mfgDate: '2024-10-15',
          expDate: '2025-10-15',
          status: 'Available',
          lastMovementAt: '2025-01-26 09:15',
          lastMovementBy: 'Production Team',
          notes: 'Adjustment needed - over consumption',
          badges: ['negative_stock'],
        },
      ],
    },
    {
      id: '5',
      organization: 'Tech Solutions Ltd',
      branch: 'South Branch',
      warehouse: 'Distribution Center',
      location: 'A-02-01',
      itemCode: 'PHONE-SAM-001',
      itemName: 'Samsung Galaxy S24',
      goodsType: 'FG',
      tracking: 'Serial',
      displayUoM: 'PC',
      qtyOnhand: 25,
      qtyAllocated: 5,
      qtyAvailable: 20,
      lastMovementAt: '2025-01-28 08:00',
      status: 'Active',
      badges: [],
      serialNumbers: Array.from({ length: 25 }, (_, i) => ({
        serialNo: `IMEI-${350000000000000 + i}`,
        status: (i < 5 ? 'Hold' : 'Available') as 'Hold' | 'Available',
        onhand: 1,
        receivedAt: '2025-01-20',
        receivedBy: 'Admin User',
        lastMovementAt: '2025-01-20 10:00',
        lastMovementBy: 'Admin User',
        notes: i < 5 ? 'Reserved for VIP customer' : '',
      })),
    },
  ]);

  // Mock stock card data
  const mockStockMovements: StockMovement[] = [
    {
      id: '1',
      movementAt: '2025-01-28 14:30',
      docType: 'Goods Issue',
      refNo: 'GI-2025-001',
      inQty: 0,
      outQty: 2,
      balance: 15,
      serialLot: 'Multiple',
      locFromTo: 'A-01-01 → Customer',
      performedBy: 'John Doe',
      notes: 'Sales order SO-2025-100',
    },
    {
      id: '2',
      movementAt: '2025-01-20 10:00',
      docType: 'Goods Receipt',
      refNo: 'GR-2025-005',
      inQty: 5,
      outQty: 0,
      balance: 17,
      serialLot: 'Multiple serials',
      locFromTo: 'Supplier → A-01-01',
      performedBy: 'Jane Smith',
      notes: 'PO-2025-010',
    },
    {
      id: '3',
      movementAt: '2025-01-15 09:00',
      docType: 'Goods Receipt',
      refNo: 'GR-2025-001',
      inQty: 12,
      outQty: 0,
      balance: 12,
      serialLot: 'Initial stock',
      locFromTo: 'Supplier → A-01-01',
      performedBy: 'John Doe',
      notes: 'Initial inventory',
    },
  ];

  // Filter data
  const filteredData = stockData.filter((item) => {
    if (filters.activeOnly && item.status !== 'Active') return false;
    if (filters.organization !== 'all' && item.organization !== filters.organization) return false;
    if (filters.branch !== 'all' && item.branch !== filters.branch) return false;
    if (filters.warehouse !== 'all' && item.warehouse !== filters.warehouse) return false;
    if (filters.location !== 'all' && item.location !== filters.location) return false;
    if (filters.goodsType !== 'all' && item.goodsType !== filters.goodsType) return false;
    if (filters.tracking !== 'all' && item.tracking !== filters.tracking) return false;
    if (filters.hasNegative && item.qtyOnhand >= 0) return false;
    if (filters.displayUoM !== 'all' && item.displayUoM !== filters.displayUoM) return false;
    if (searchTerm && !item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Filter serials in drilldown
  const getFilteredSerials = (serials: SerialNumber[] | undefined) => {
    if (!serials) return [];
    return serials.filter(serial => {
      if (serialFilters.contains && !serial.serialNo.toLowerCase().includes(serialFilters.contains.toLowerCase())) return false;
      if (serialFilters.status.length > 0 && !serialFilters.status.includes(serial.status)) return false;
      return true;
    });
  };

  // Filter lots in drilldown
  const getFilteredLots = (lots: LotNumber[] | undefined) => {
    if (!lots) return [];
    return lots.filter(lot => {
      if (lotFilters.lotNo && !lot.lotNo.toLowerCase().includes(lotFilters.lotNo.toLowerCase())) return false;
      if (lotFilters.nearExpiry) {
        const expDate = new Date(lot.expDate);
        const today = new Date();
        const daysUntilExpiry = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > 30) return false; // Assuming N=30 days
      }
      return true;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      organization: 'all',
      branch: 'all',
      warehouse: 'all',
      location: 'all',
      goodsType: 'all',
      tracking: 'all',
      activeOnly: true,
      displayUoM: 'all',
      hasNegative: false,
    });
    setSearchTerm('');
    toast.success(t('reset_filters'));
  };

  const handleExport = () => {
    toast.success(t('export_started'));
  };

  const handleRowDoubleClick = (item: StockOnhandItem) => {
    setDrilldownItem(item);
    // Reset inline filters when opening drilldown
    setSerialFilters({ contains: '', receivedRange: { from: '', to: '' }, status: [] });
    setLotFilters({ lotNo: '', mfgRange: { from: '', to: '' }, expRange: { from: '', to: '' }, nearExpiry: false });
  };

  const handleSerialDoubleClick = (item: StockOnhandItem, serial: SerialNumber) => {
    setSelectedSerial({ item, serial });
  };

  const handleLotDoubleClick = (item: StockOnhandItem, lot: LotNumber) => {
    setSelectedLot({ item, lot });
  };

  const openStockCard = (item: StockOnhandItem, filter?: { type: 'serial' | 'lot'; value: string }) => {
    setStockCardItem(item);
    setStockCardFilter(filter || { type: 'all', value: '' });
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'low_stock':
        return 'default';
      case 'near_expiry':
        return 'warning';
      case 'expired':
        return 'destructive';
      case 'negative_stock':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'low_stock':
        return <TrendingDown className="h-3 w-3 mr-1" />;
      case 'near_expiry':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'expired':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'negative_stock':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDateTime = (dateTime: string) => {
    return dateTime;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>{t('stock_onhand_title')}</h1>
        <p className="text-muted-foreground">
          {t('current_stock_snapshot')} {new Date().toLocaleString()}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('filters')}</CardTitle>
              <CardDescription>
                {filteredData.length} {t('of')} {stockData.length} {t('entries')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                <Filter className="h-4 w-4 mr-2" />
                {showAdvanced ? t('hide_advanced') : t('show_advanced')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                {t('reset_filters')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 className="h-4 w-4 mr-2" />
                    {t('column_visibility')}
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
                            : visibleColumns.filter((col) => col !== column.value)
                        );
                      }}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="default" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t('export_excel')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('search')} ${t('item_code')}, ${t('item_name')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="max-w-[200px]">
              <Label>{t('organization')}</Label>
              <Select
                value={filters.organization}
                onValueChange={(value) => {
                  setFilters({ 
                    ...filters, 
                    organization: value,
                    branch: 'all', // Reset dependent filters
                    warehouse: 'all'
                  });
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {organizationOptions.map((org) => (
                    <SelectItem key={org.value} value={org.value}>
                      {org.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-w-[200px]">
              <Label>{t('branch')}</Label>
              <Select
                value={filters.branch}
                onValueChange={(value) => {
                  setFilters({ 
                    ...filters, 
                    branch: value,
                    warehouse: 'all' // Reset dependent filter
                  });
                }}
                disabled={filters.organization === 'all'}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {availableBranches.map((branch) => (
                    <SelectItem key={branch.value} value={branch.value}>
                      {branch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-w-[200px]">
              <Label>{t('warehouse')}</Label>
              <Select
                value={filters.warehouse}
                onValueChange={(value) => setFilters({ ...filters, warehouse: value })}
                disabled={filters.branch === 'all'}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {availableWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.value} value={warehouse.value}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-w-[200px]">
              <Label>{t('location')}</Label>
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ ...filters, location: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-w-[200px]">
              <Label>{t('goods_type')}</Label>
              <Select
                value={filters.goodsType}
                onValueChange={(value) => setFilters({ ...filters, goodsType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {goodsTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-w-[200px]">
              <Label>{t('tracking')}</Label>
              <Select
                value={filters.tracking}
                onValueChange={(value) => setFilters({ ...filters, tracking: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {trackingOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{t('display_uom')}</Label>
                  <Select
                    value={filters.displayUoM}
                    onValueChange={(value) => setFilters({ ...filters, displayUoM: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="PC">PC</SelectItem>
                      <SelectItem value="BOX">BOX</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={filters.hasNegative}
                      onCheckedChange={(checked) => setFilters({ ...filters, hasNegative: checked })}
                    />
                    <Label>{t('has_negative')}</Label>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Onhand Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('organization') && <TableHead>{t('organization')}</TableHead>}
                  {visibleColumns.includes('branch') && <TableHead>{t('branch')}</TableHead>}
                  {visibleColumns.includes('warehouse') && <TableHead>{t('warehouse')}</TableHead>}
                  {visibleColumns.includes('location') && <TableHead>{t('location')}</TableHead>}
                  {visibleColumns.includes('itemCode') && <TableHead>{t('item_code')}</TableHead>}
                  {visibleColumns.includes('itemName') && <TableHead>{t('item_name')}</TableHead>}
                  {visibleColumns.includes('goodsType') && <TableHead>{t('goods_type')}</TableHead>}
                  {visibleColumns.includes('tracking') && <TableHead>{t('tracking')}</TableHead>}
                  {visibleColumns.includes('uom') && <TableHead>{t('uom_base')}</TableHead>}
                  {visibleColumns.includes('onhand') && <TableHead className="text-right">{t('onhand')}</TableHead>}
                  {visibleColumns.includes('allocated') && <TableHead className="text-right">{t('allocated')}</TableHead>}
                  {visibleColumns.includes('available') && <TableHead className="text-right">{t('available')}</TableHead>}
                  {visibleColumns.includes('lastMovement') && <TableHead>{t('last_movement')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-muted-foreground">
                      {t('no_onhand_records')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onDoubleClick={() => handleRowDoubleClick(item)}
                      title={t('double_click_to_view_details')}
                    >
                      {visibleColumns.includes('organization') && <TableCell>{item.organization}</TableCell>}
                      {visibleColumns.includes('branch') && <TableCell>{item.branch}</TableCell>}
                      {visibleColumns.includes('warehouse') && <TableCell>{item.warehouse}</TableCell>}
                      {visibleColumns.includes('location') && <TableCell>{item.location}</TableCell>}
                      {visibleColumns.includes('itemCode') && (
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{item.itemCode}</span>
                            {item.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.badges.map((badge) => (
                                  <Badge key={badge} variant={getBadgeVariant(badge) as any} className="text-xs">
                                    {getBadgeIcon(badge)}
                                    {t(badge)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes('itemName') && <TableCell>{item.itemName}</TableCell>}
                      {visibleColumns.includes('goodsType') && (
                        <TableCell>
                          <Badge variant="outline">{item.goodsType}</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes('tracking') && (
                        <TableCell>
                          <Badge variant={item.tracking === 'None' ? 'secondary' : 'default'}>
                            {t(`tracking_${item.tracking.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes('uom') && <TableCell>{item.displayUoM}</TableCell>}
                      {visibleColumns.includes('onhand') && <TableCell className="text-right">{formatNumber(item.qtyOnhand)}</TableCell>}
                      {visibleColumns.includes('allocated') && <TableCell className="text-right">{formatNumber(item.qtyAllocated)}</TableCell>}
                      {visibleColumns.includes('available') && <TableCell className="text-right font-medium">{formatNumber(item.qtyAvailable)}</TableCell>}
                      {visibleColumns.includes('lastMovement') && <TableCell>{formatDateTime(item.lastMovementAt)}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Drilldown Modal */}
      <Dialog open={!!drilldownItem} onOpenChange={(open) => !open && setDrilldownItem(null)}>
        <DialogContent className="w-[96vw] sm:max-w-[96vw] max-h-[92vh] overflow-y-auto">
          {drilldownItem && (
            <>
              <DialogHeader>
                <DialogTitle>{t('item_details')}</DialogTitle>
                <DialogDescription>
                  {drilldownItem.itemCode} - {drilldownItem.itemName}
                </DialogDescription>
              </DialogHeader>

              {/* Context Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">{t('organization')}</Label>
                  <p>{drilldownItem.organization}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('branch')}</Label>
                  <p>{drilldownItem.branch}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('warehouse')}</Label>
                  <p>{drilldownItem.warehouse}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('location')}</Label>
                  <p>{drilldownItem.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('tracking')}</Label>
                  <Badge>{t(`tracking_${drilldownItem.tracking.toLowerCase()}`)}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('uom_base')}</Label>
                  <p>{drilldownItem.displayUoM}</p>
                </div>
              </div>

              <Separator />

              {/* Summary Section */}
              <div className="space-y-4">
                <h3>{drilldownItem.tracking === 'None' ? t('summary_no_tracking') : t('summary')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('onhand')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-medium">{formatNumber(drilldownItem.qtyOnhand)}</p>
                      <p className="text-sm text-muted-foreground">{drilldownItem.displayUoM}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('allocated')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-medium">{formatNumber(drilldownItem.qtyAllocated)}</p>
                      <p className="text-sm text-muted-foreground">{drilldownItem.displayUoM}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('available')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-medium">{formatNumber(drilldownItem.qtyAvailable)}</p>
                      <p className="text-sm text-muted-foreground">{drilldownItem.displayUoM}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('actions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStockCard(drilldownItem)}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t('open_stock_card')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-sm text-muted-foreground">{t('read_only_base_uom')}</p>
              </div>

              {/* Serial Section */}
              {drilldownItem.tracking === 'Serial' && drilldownItem.serialNumbers && (
                <>
                  <Separator />
                  <Collapsible open={serialsOpen} onOpenChange={setSerialsOpen}>
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {serialsOpen ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                          <h3 className="m-0">{t('serials')} ({drilldownItem.serialNumbers.length})</h3>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-4 mt-4">
                      {/* Inline Filters for Serials */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                        <div>
                          <Label>{t('serial_no')} ({t('contains')})</Label>
                          <Input
                            placeholder={`${t('search')}...`}
                            value={serialFilters.contains}
                            onChange={(e) => setSerialFilters({ ...serialFilters, contains: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>{t('status')}</Label>
                          <MultiSelect
                            options={statusOptions}
                            selected={serialFilters.status}
                            onChange={(selected) => setSerialFilters({ ...serialFilters, status: selected })}
                            placeholder={t('all')}
                            searchPlaceholder={t('search')}
                            emptyText={t('no_items_found')}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {/* Serials Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('serial_no')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="text-right">{t('onhand')}</TableHead>
                            <TableHead>{t('received_date')}</TableHead>
                            <TableHead>{t('last_movement')}</TableHead>
                            <TableHead>{t('notes')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredSerials(drilldownItem.serialNumbers).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                {t('no_serials_found')}
                              </TableCell>
                            </TableRow>
                          ) : (
                            getFilteredSerials(drilldownItem.serialNumbers).map((serial) => (
                              <TableRow
                                key={serial.serialNo}
                                className="hover:bg-muted/50 cursor-pointer"
                                onDoubleClick={() => handleSerialDoubleClick(drilldownItem, serial)}
                                title={t('double_click_to_view_details')}
                              >
                                <TableCell className="font-medium">{serial.serialNo}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      serial.status === 'Available'
                                        ? 'default'
                                        : serial.status === 'Hold'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                  >
                                    {t(serial.status === 'Available' ? 'available_status' : serial.status.toLowerCase())}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{serial.onhand}</TableCell>
                                <TableCell>{serial.receivedAt}</TableCell>
                                <TableCell>{formatDateTime(serial.lastMovementAt)}</TableCell>
                                <TableCell>{serial.notes || '-'}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}

              {/* Lot Section */}
              {drilldownItem.tracking === 'Lot' && drilldownItem.lots && (
                <>
                  <Separator />
                  <Collapsible open={lotsOpen} onOpenChange={setLotsOpen}>
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {lotsOpen ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                          <h3 className="m-0">{t('lots')} ({drilldownItem.lots.length})</h3>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-4 mt-4">
                      {/* Inline Filters for Lots */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                        <div>
                          <Label>{t('lot_no')}</Label>
                          <Input
                            placeholder={`${t('search')}...`}
                            value={lotFilters.lotNo}
                            onChange={(e) => setLotFilters({ ...lotFilters, lotNo: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={lotFilters.nearExpiry}
                              onCheckedChange={(checked) => setLotFilters({ ...lotFilters, nearExpiry: checked })}
                            />
                            <Label>{t('near_expiry_days')}</Label>
                          </div>
                        </div>
                      </div>

                      {/* Lots Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('lot_no')}</TableHead>
                            <TableHead className="text-right">{t('onhand')}</TableHead>
                            <TableHead className="text-right">{t('allocated')}</TableHead>
                            <TableHead className="text-right">{t('available')}</TableHead>
                            <TableHead>{t('mfg_date')}</TableHead>
                            <TableHead>{t('exp_date')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead>{t('notes')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredLots(drilldownItem.lots).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-muted-foreground">
                                {t('no_lots_found')}
                              </TableCell>
                            </TableRow>
                          ) : (
                            getFilteredLots(drilldownItem.lots).map((lot) => (
                              <TableRow
                                key={lot.lotNo}
                                className="hover:bg-muted/50 cursor-pointer"
                                onDoubleClick={() => handleLotDoubleClick(drilldownItem, lot)}
                                title={t('double_click_to_view_details')}
                              >
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">{lot.lotNo}</span>
                                    {lot.badges.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {lot.badges.map((badge) => (
                                          <Badge key={badge} variant={getBadgeVariant(badge) as any} className="text-xs">
                                            {getBadgeIcon(badge)}
                                            {t(badge)}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{formatNumber(lot.qtyOnhand)}</TableCell>
                                <TableCell className="text-right">{formatNumber(lot.qtyAllocated)}</TableCell>
                                <TableCell className="text-right font-medium">{formatNumber(lot.qtyAvailable)}</TableCell>
                                <TableCell>{lot.mfgDate}</TableCell>
                                <TableCell>{lot.expDate}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      lot.status === 'Available'
                                        ? 'default'
                                        : lot.status === 'Hold'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                  >
                                    {t(lot.status === 'Available' ? 'available_status' : lot.status.toLowerCase())}
                                  </Badge>
                                </TableCell>
                                <TableCell>{lot.notes || '-'}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Serial Detail Modal */}
      <Dialog open={!!selectedSerial} onOpenChange={(open) => !open && setSelectedSerial(null)}>
        <DialogContent className="w-[90vw] sm:max-w-[90vw]">
          {selectedSerial && (
            <>
              <DialogHeader>
                <DialogTitle>{t('serial_detail')}</DialogTitle>
                <DialogDescription>
                  {selectedSerial.item.itemCode} - {selectedSerial.item.itemName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('organization')}</Label>
                    <p>{selectedSerial.item.organization}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('branch')}</Label>
                    <p>{selectedSerial.item.branch}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('warehouse')}</Label>
                    <p>{selectedSerial.item.warehouse}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('location')}</Label>
                    <p>{selectedSerial.item.location}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{t('serial_no')}</Label>
                    <p className="font-medium">{selectedSerial.serial.serialNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('status')}</Label>
                    <Badge
                      variant={
                        selectedSerial.serial.status === 'Available'
                          ? 'default'
                          : selectedSerial.serial.status === 'Hold'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {t(selectedSerial.serial.status === 'Available' ? 'available_status' : selectedSerial.serial.status.toLowerCase())}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('onhand')}</Label>
                    <p>{selectedSerial.serial.onhand} {selectedSerial.item.displayUoM}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('received_date')}</Label>
                    <p>{selectedSerial.serial.receivedAt}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('received_by')}</Label>
                    <p>{selectedSerial.serial.receivedBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('last_movement')}</Label>
                    <p>{formatDateTime(selectedSerial.serial.lastMovementAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('last_movement_by')}</Label>
                    <p>{selectedSerial.serial.lastMovementBy}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{t('notes')}</Label>
                    <p>{selectedSerial.serial.notes || '-'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      openStockCard(selectedSerial.item, { type: 'serial', value: selectedSerial.serial.serialNo });
                      setSelectedSerial(null);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t('open_stock_card_serial')}
                  </Button>
                  <Button variant="default" onClick={() => setSelectedSerial(null)}>
                    {t('close')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lot Detail Modal */}
      <Dialog open={!!selectedLot} onOpenChange={(open) => !open && setSelectedLot(null)}>
        <DialogContent className="w-[90vw] sm:max-w-[90vw]">
          {selectedLot && (
            <>
              <DialogHeader>
                <DialogTitle>{t('lot_detail')}</DialogTitle>
                <DialogDescription>
                  {selectedLot.item.itemCode} - {selectedLot.item.itemName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('organization')}</Label>
                    <p>{selectedLot.item.organization}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('branch')}</Label>
                    <p>{selectedLot.item.branch}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('warehouse')}</Label>
                    <p>{selectedLot.item.warehouse}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('location')}</Label>
                    <p>{selectedLot.item.location}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{t('lot_no')}</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedLot.lot.lotNo}</p>
                      {selectedLot.lot.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedLot.lot.badges.map((badge) => (
                            <Badge key={badge} variant={getBadgeVariant(badge) as any}>
                              {getBadgeIcon(badge)}
                              {t(badge)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('onhand')}</Label>
                    <p>{formatNumber(selectedLot.lot.qtyOnhand)} {selectedLot.item.displayUoM}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('allocated')}</Label>
                    <p>{formatNumber(selectedLot.lot.qtyAllocated)} {selectedLot.item.displayUoM}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('available')}</Label>
                    <p className="font-medium">{formatNumber(selectedLot.lot.qtyAvailable)} {selectedLot.item.displayUoM}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('status')}</Label>
                    <Badge
                      variant={
                        selectedLot.lot.status === 'Available'
                          ? 'default'
                          : selectedLot.lot.status === 'Hold'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {t(selectedLot.lot.status === 'Available' ? 'available_status' : selectedLot.lot.status.toLowerCase())}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('mfg_date')}</Label>
                    <p>{selectedLot.lot.mfgDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('exp_date')}</Label>
                    <p>{selectedLot.lot.expDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('last_movement')}</Label>
                    <p>{formatDateTime(selectedLot.lot.lastMovementAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('last_movement_by')}</Label>
                    <p>{selectedLot.lot.lastMovementBy}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{t('notes')}</Label>
                    <p>{selectedLot.lot.notes || '-'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      openStockCard(selectedLot.item, { type: 'lot', value: selectedLot.lot.lotNo });
                      setSelectedLot(null);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t('open_stock_card_lot')}
                  </Button>
                  <Button variant="default" onClick={() => setSelectedLot(null)}>
                    {t('close')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Stock Card Modal */}
      <Dialog open={!!stockCardItem} onOpenChange={(open) => !open && setStockCardItem(null)}>
        <DialogContent className="w-[98vw] sm:max-w-[98vw] max-h-[92vh] overflow-y-auto">
          {stockCardItem && (
            <>
              <DialogHeader>
                <DialogTitle>{t('stock_card')}</DialogTitle>
                <DialogDescription>
                  {stockCardItem.itemCode} - {stockCardItem.itemName}
                  {stockCardFilter.type !== 'all' && ` • ${stockCardFilter.type === 'serial' ? t('serial_no') : t('lot_no')}: ${stockCardFilter.value}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-muted-foreground">{t('warehouse')}</Label>
                    <p>{stockCardItem.warehouse}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('location')}</Label>
                    <p>{stockCardItem.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('tracking')}</Label>
                    <Badge>{t(`tracking_${stockCardItem.tracking.toLowerCase()}`)}</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('uom_base')}</Label>
                    <p>{stockCardItem.displayUoM}</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('movement_at')}</TableHead>
                      <TableHead>{t('doc_type')}</TableHead>
                      <TableHead>{t('ref_no')}</TableHead>
                      <TableHead className="text-right">{t('in_qty')}</TableHead>
                      <TableHead className="text-right">{t('out_qty')}</TableHead>
                      <TableHead className="text-right">{t('balance')}</TableHead>
                      <TableHead>{t('serial_no')}/{t('lot_no')}</TableHead>
                      <TableHead>{t('loc_from_to')}</TableHead>
                      <TableHead>{t('performed_by')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{formatDateTime(movement.movementAt)}</TableCell>
                        <TableCell>{movement.docType}</TableCell>
                        <TableCell>{movement.refNo}</TableCell>
                        <TableCell className="text-right">{movement.inQty > 0 ? formatNumber(movement.inQty) : '-'}</TableCell>
                        <TableCell className="text-right">{movement.outQty > 0 ? formatNumber(movement.outQty) : '-'}</TableCell>
                        <TableCell className="text-right font-medium">{formatNumber(movement.balance)}</TableCell>
                        <TableCell>{movement.serialLot}</TableCell>
                        <TableCell>{movement.locFromTo}</TableCell>
                        <TableCell>{movement.performedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('export_excel')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
