import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Search, Download, Columns3, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from './ui/badge';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface LocationTableProps {
  columns: Column[];
  data: any[];
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onExport?: () => void;
  warehouseFilter?: string;
  onWarehouseFilterChange?: (value: string) => void;
  locationTypeFilter?: string;
  onLocationTypeFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  warehouses?: Array<{ code: string; name: string }>;
}

export function LocationTable({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  onRowDoubleClick,
  onExport,
  warehouseFilter = 'all',
  onWarehouseFilterChange,
  locationTypeFilter = 'all',
  onLocationTypeFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  warehouses = [],
}: LocationTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  // Filter data
  const filteredData = data.filter((row) => {
    const matchesSearch = Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesWarehouse = warehouseFilter === 'all' || row.warehouseCode === warehouseFilter;
    const matchesLocationType = locationTypeFilter === 'all' || row.locationType === locationTypeFilter;
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
    return matchesSearch && matchesWarehouse && matchesLocationType && matchesStatus;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCellValue = (key: string, value: any, row: any) => {
    if (key === 'status') {
      return (
        <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
          {value === 'Active' ? t('active') : t('inactive')}
        </Badge>
      );
    }
    if (key === 'locationType') {
      return t(`location_type_${value.toLowerCase()}`);
    }
    if (key === 'allowedGoodsType' || key === 'restrictedGoodsType') {
      if (!value || value.length === 0) return '-';
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((type: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      );
    }
    return value || '-';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Warehouse Filter */}
          {onWarehouseFilterChange && (
            <Select value={warehouseFilter} onValueChange={onWarehouseFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filter_by_warehouse')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_warehouses')}</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.code} value={warehouse.code}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Location Type Filter */}
          {onLocationTypeFilterChange && (
            <Select value={locationTypeFilter} onValueChange={onLocationTypeFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filter_by_location_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_location_types')}</SelectItem>
                <SelectItem value="Storage">{t('location_type_storage')}</SelectItem>
                <SelectItem value="Picking">{t('location_type_picking')}</SelectItem>
                <SelectItem value="Receiving">{t('location_type_receiving')}</SelectItem>
                <SelectItem value="Shipping">{t('location_type_shipping')}</SelectItem>
                <SelectItem value="Other">{t('location_type_other')}</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Status Filter */}
          {onStatusFilterChange && (
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_status')}</SelectItem>
                <SelectItem value="Active">{t('active')}</SelectItem>
                <SelectItem value="Inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('export_excel')}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="mr-2 h-4 w-4" />
                {t('column_visibility')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns[column.key]}
                  onCheckedChange={() => toggleColumnVisibility(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((col) => visibleColumns[col.key])
                .map((column) => (
                  <TableHead
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={column.sortable ? 'cursor-pointer select-none' : ''}
                  >
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                ))}
              <TableHead className="w-[80px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.filter((col) => visibleColumns[col.key]).length + 1}
                  className="h-24 text-center"
                >
                  {searchTerm || warehouseFilter !== 'all' || locationTypeFilter !== 'all' || statusFilter !== 'all'
                    ? t('no_results_message')
                    : t('no_location_message')}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer"
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {columns
                    .filter((col) => visibleColumns[col.key])
                    .map((column) => (
                      <TableCell key={column.key}>
                        {renderCellValue(column.key, row[column.key], row)}
                      </TableCell>
                    ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(row)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('view_details')}
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(row)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </DropdownMenuItem>
                        )}
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('showing')} {startIndex + 1} {t('of')} {Math.min(endIndex, sortedData.length)} {t('of')}{' '}
          {sortedData.length} {t('entries')}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            {currentPage} / {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
