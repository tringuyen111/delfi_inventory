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

interface ModelGoodsTableProps {
  columns: Column[];
  data: any[];
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onExport?: () => void;
  goodsTypeFilter?: string;
  onGoodsTypeFilterChange?: (value: string) => void;
  trackingFilter?: string;
  onTrackingFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  goodsTypes?: Array<{ code: string; name: string }>;
}

export function ModelGoodsTable({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  onRowDoubleClick,
  onExport,
  goodsTypeFilter,
  onGoodsTypeFilterChange,
  trackingFilter,
  onTrackingFilterChange,
  statusFilter,
  onStatusFilterChange,
  goodsTypes = [],
}: ModelGoodsTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.key)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter data based on search and filters
  const filteredData = data.filter((row) => {
    const matchesSearch = 
      row.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGoodsType = !goodsTypeFilter || goodsTypeFilter === 'all' || row.goodsTypeCode === goodsTypeFilter;
    const matchesTracking = !trackingFilter || trackingFilter === 'all' || row.tracking === trackingFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || row.status === statusFilter;
    
    return matchesSearch && matchesGoodsType && matchesTracking && matchesStatus;
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

  // Paginate data
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((current) =>
      current.includes(columnKey)
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey]
    );
  };

  const renderCellContent = (row: any, columnKey: string) => {
    if (columnKey === 'status') {
      return (
        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
          {row.status === 'Active' ? t('active') : t('inactive')}
        </Badge>
      );
    }
    if (columnKey === 'tracking') {
      const trackingMap: Record<string, string> = {
        'None': t('tracking_none'),
        'Serial': t('tracking_serial'),
        'Lot': t('tracking_lot'),
      };
      return (
        <Badge variant="outline">
          {trackingMap[row.tracking] || row.tracking}
        </Badge>
      );
    }
    return row[columnKey];
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <Select
          value={goodsTypeFilter || 'all'}
          onValueChange={onGoodsTypeFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('goods_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {goodsTypes.map((type) => (
              <SelectItem key={type.code} value={type.code}>
                {type.code} - {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={trackingFilter || 'all'}
          onValueChange={onTrackingFilterChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('tracking_method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracking</SelectItem>
            <SelectItem value="None">{t('tracking_none')}</SelectItem>
            <SelectItem value="Serial">{t('tracking_serial')}</SelectItem>
            <SelectItem value="Lot">{t('tracking_lot')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || 'all'}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">{t('active')}</SelectItem>
            <SelectItem value="Inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('export_excel')}
            </Button>
          )}

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3 className="mr-2 h-4 w-4" />
                {t('column_visibility')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((col) => visibleColumns.includes(col.key))
                .map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? 'cursor-pointer select-none' : ''}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable &&
                        sortConfig?.key === column.key &&
                        (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                    </div>
                  </TableHead>
                ))}
              <TableHead className="w-[100px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                  className="h-24 text-center"
                >
                  {searchTerm || goodsTypeFilter !== 'all' || trackingFilter !== 'all' || statusFilter !== 'all' 
                    ? t('no_matching_model_goods') 
                    : t('no_model_goods_message')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50"
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {columns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((column) => (
                      <TableCell key={column.key}>
                        {renderCellContent(row, column.key)}
                      </TableCell>
                    ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(row)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('view')}
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('showing')} {startIndex + 1} - {Math.min(startIndex + pageSize, sortedData.length)}{' '}
            {t('of')} {sortedData.length} {t('entries')}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
