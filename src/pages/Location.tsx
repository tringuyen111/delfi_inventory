import { useState } from 'react';
import { LocationTable } from '../components/LocationTable';
import { Button } from '../components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../components/ui/separator';
import { MultiSelect } from '../components/ui/multi-select';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

interface LocationData {
  code: string;
  name: string;
  warehouseCode: string;
  warehouseName: string;
  locationType: 'Storage' | 'Picking' | 'Receiving' | 'Shipping' | 'Other';
  status: 'Active' | 'Inactive';
  allowedGoodsType: string[];
  restrictedGoodsType: string[];
  description: string;
  updatedAt: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
}

export function Location() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<LocationData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [itemToDelete, setItemToDelete] = useState<LocationData | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<LocationData>>({
    code: '',
    name: '',
    warehouseCode: '',
    locationType: 'Storage',
    status: 'Active',
    allowedGoodsType: [],
    restrictedGoodsType: [],
    description: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] = useState<'Active' | 'Inactive' | null>(null);

  // Mock data for Warehouses
  const warehouses = [
    { code: 'WH001', name: 'Main Warehouse', branchCode: 'BR001' },
    { code: 'WH002', name: 'Distribution Center', branchCode: 'BR001' },
    { code: 'WH003', name: 'North Warehouse', branchCode: 'BR002' },
  ];

  // Mock data for Goods Types
  const goodsTypes = [
    { code: 'FG', name: 'Finished Goods' },
    { code: 'RM', name: 'Raw Material' },
    { code: 'WIP', name: 'Work In Progress' },
    { code: 'SFG', name: 'Semi-Finished Goods' },
    { code: 'CONS', name: 'Consumables' },
  ];

  // Mock data for Locations
  const [locations, setLocations] = useState<LocationData[]>([
    {
      code: 'LOC-A01',
      name: 'Aisle A - Shelf 01',
      warehouseCode: 'WH001',
      warehouseName: 'Main Warehouse',
      locationType: 'Storage',
      status: 'Active',
      allowedGoodsType: ['FG', 'SFG'],
      restrictedGoodsType: ['RM'],
      description: 'High-bay storage for finished goods',
      updatedAt: '2025-01-15',
      createdBy: 'admin',
      createdAt: '2025-01-10',
      updatedBy: 'admin',
    },
    {
      code: 'LOC-P01',
      name: 'Picking Zone 01',
      warehouseCode: 'WH001',
      warehouseName: 'Main Warehouse',
      locationType: 'Picking',
      status: 'Active',
      allowedGoodsType: [],
      restrictedGoodsType: [],
      description: 'Fast-moving items picking area',
      updatedAt: '2025-01-18',
      createdBy: 'admin',
      createdAt: '2025-01-15',
      updatedBy: 'admin',
    },
    {
      code: 'LOC-R01',
      name: 'Receiving Dock 01',
      warehouseCode: 'WH002',
      warehouseName: 'Distribution Center',
      locationType: 'Receiving',
      status: 'Active',
      allowedGoodsType: ['RM', 'CONS'],
      restrictedGoodsType: ['FG'],
      description: 'Main receiving area',
      updatedAt: '2025-01-20',
      createdBy: 'admin',
      createdAt: '2025-01-12',
      updatedBy: 'user1',
    },
    {
      code: 'LOC-S01',
      name: 'Shipping Dock 01',
      warehouseCode: 'WH002',
      warehouseName: 'Distribution Center',
      locationType: 'Shipping',
      status: 'Active',
      allowedGoodsType: ['FG'],
      restrictedGoodsType: ['RM', 'WIP'],
      description: 'Outbound shipping area',
      updatedAt: '2025-01-22',
      createdBy: 'admin',
      createdAt: '2025-01-14',
      updatedBy: 'user2',
    },
    {
      code: 'LOC-A02',
      name: 'Aisle A - Shelf 02',
      warehouseCode: 'WH001',
      warehouseName: 'Main Warehouse',
      locationType: 'Storage',
      status: 'Inactive',
      allowedGoodsType: [],
      restrictedGoodsType: [],
      description: 'Under maintenance',
      updatedAt: '2025-01-25',
      createdBy: 'admin',
      createdAt: '2025-01-10',
      updatedBy: 'admin',
    },
  ]);

  const columns = [
    { key: 'code', label: t('location_code'), sortable: true },
    { key: 'name', label: t('location_name'), sortable: true },
    { key: 'warehouseName', label: t('warehouse'), sortable: true },
    { key: 'locationType', label: t('location_type'), sortable: true },
    { key: 'allowedGoodsType', label: t('allowed_goods_type'), sortable: false },
    { key: 'restrictedGoodsType', label: t('restricted_goods_type'), sortable: false },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'updatedAt', label: t('updated_at'), sortable: true },
  ];

  const handleCreate = () => {
    setViewMode('create');
    setFormData({
      code: '',
      name: '',
      warehouseCode: '',
      locationType: 'Storage',
      status: 'Active',
      allowedGoodsType: [],
      restrictedGoodsType: [],
      description: '',
    });
    setFormErrors({});
  };

  const handleEdit = (item: LocationData) => {
    setSelectedItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      warehouseCode: item.warehouseCode,
      locationType: item.locationType,
      status: item.status,
      allowedGoodsType: item.allowedGoodsType,
      restrictedGoodsType: item.restrictedGoodsType,
      description: item.description,
    });
    setFormErrors({});
    setViewMode('edit');
  };

  const handleView = (item: LocationData) => {
    setSelectedItem(item);
    setViewMode('view');
  };

  const handleDelete = (item: LocationData) => {
    // Simulate checking if location is in use
    const isInUse = Math.random() > 0.5;
    
    if (isInUse) {
      toast.error(t('cannot_delete_location_in_use'));
      return;
    }
    
    setItemToDelete(item);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && confirmCode === itemToDelete.code) {
      setLocations(locations.filter((loc) => loc.code !== itemToDelete.code));
      toast.success(t('location_deleted_successfully'));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setConfirmCode('');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('location_code_required');
    } else if (
      viewMode === 'create' &&
      locations.some((loc) => loc.code === formData.code && loc.warehouseCode === formData.warehouseCode)
    ) {
      errors.code = t('location_code_exists_in_warehouse');
    }

    if (!formData.name?.trim()) {
      errors.name = t('location_name_required');
    }

    if (!formData.warehouseCode) {
      errors.warehouseCode = t('warehouse_required');
    }

    // Check for conflict between allowed and restricted goods types
    const allowedSet = new Set(formData.allowedGoodsType || []);
    const restrictedSet = new Set(formData.restrictedGoodsType || []);
    const intersection = [...allowedSet].filter((x) => restrictedSet.has(x));
    
    if (intersection.length > 0) {
      errors.goodsType = t('goods_type_conflict');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (closeAfter = false) => {
    if (!validateForm()) {
      toast.error(t('please_fix_errors'));
      return;
    }

    const warehouse = warehouses.find((w) => w.code === formData.warehouseCode);
    const now = new Date().toISOString().split('T')[0];

    if (viewMode === 'create') {
      const newLocation: LocationData = {
        code: formData.code!,
        name: formData.name!,
        warehouseCode: formData.warehouseCode!,
        warehouseName: warehouse?.name || '',
        locationType: formData.locationType!,
        status: formData.status!,
        allowedGoodsType: formData.allowedGoodsType || [],
        restrictedGoodsType: formData.restrictedGoodsType || [],
        description: formData.description || '',
        createdBy: 'current_user',
        createdAt: now,
        updatedBy: 'current_user',
        updatedAt: now,
      };
      setLocations([...locations, newLocation]);
      toast.success(t('location_created_successfully'));
    } else if (viewMode === 'edit' && selectedItem) {
      setLocations(
        locations.map((loc) =>
          loc.code === selectedItem.code
            ? {
                ...loc,
                name: formData.name!,
                warehouseCode: formData.warehouseCode!,
                warehouseName: warehouse?.name || '',
                locationType: formData.locationType!,
                status: formData.status!,
                allowedGoodsType: formData.allowedGoodsType || [],
                restrictedGoodsType: formData.restrictedGoodsType || [],
                description: formData.description || '',
                updatedBy: 'current_user',
                updatedAt: now,
              }
            : loc
        )
      );
      toast.success(t('location_updated_successfully'));
    }

    if (closeAfter) {
      setViewMode('list');
      setSelectedItem(null);
    }
  };

  const handleStatusChange = (newStatus: 'Active' | 'Inactive') => {
    if (formData.status === newStatus) return;

    if (newStatus === 'Inactive') {
      setPendingStatusChange(newStatus);
      setStatusChangeDialogOpen(true);
    } else {
      setFormData({ ...formData, status: newStatus });
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      setFormData({ ...formData, status: pendingStatusChange });
      setStatusChangeDialogOpen(false);
      setPendingStatusChange(null);
      toast.info(t('status_changed'));
    }
  };

  const handleExport = () => {
    toast.success(t('export_started'));
  };

  // Detail View
  if (viewMode === 'view' && selectedItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('location_details')}</h1>
            <p className="text-muted-foreground">{selectedItem.code}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleEdit(selectedItem)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('location_code')}</Label>
              <p>{selectedItem.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('location_name')}</Label>
              <p>{selectedItem.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('warehouse')}</Label>
              <p>{selectedItem.warehouseName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('location_type')}</Label>
              <p>{t(`location_type_${selectedItem.locationType.toLowerCase()}`)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div>
                <Badge variant={selectedItem.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedItem.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('allowed_goods_type')}</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedItem.allowedGoodsType.length > 0 ? (
                  selectedItem.allowedGoodsType.map((type) => {
                    const goodsType = goodsTypes.find((gt) => gt.code === type);
                    return (
                      <Badge key={type} variant="outline">
                        {goodsType?.code} - {goodsType?.name}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">{t('all_goods_types')}</span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('restricted_goods_type')}</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedItem.restrictedGoodsType.length > 0 ? (
                  selectedItem.restrictedGoodsType.map((type) => {
                    const goodsType = goodsTypes.find((gt) => gt.code === type);
                    return (
                      <Badge key={type} variant="outline" className="bg-destructive/10">
                        {goodsType?.code} - {goodsType?.name}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">{t('none')}</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">{t('description')}</Label>
              <p>{selectedItem.description || '-'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('created_by')}</Label>
              <p>{selectedItem.createdBy}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('created_at')}</Label>
              <p>{selectedItem.createdAt}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('updated_by')}</Label>
              <p>{selectedItem.updatedBy}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('updated_at')}</Label>
              <p>{selectedItem.updatedAt}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create/Edit Form View
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>
              {viewMode === 'create' 
                ? t('create_location') 
                : `${t('edit_location')}${selectedItem?.code ? ` - ${selectedItem.code}` : ''}`}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'create' ? t('create_new_location') : t('edit_location_information')}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Location Code */}
            <div>
              <Label htmlFor="code">
                {t('location_code')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={viewMode === 'edit'}
                className={formErrors.code ? 'border-destructive' : ''}
              />
              {formErrors.code && (
                <p className="text-sm text-destructive mt-1">{formErrors.code}</p>
              )}
            </div>

            {/* Location Name */}
            <div>
              <Label htmlFor="name">
                {t('location_name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Warehouse */}
            <div>
              <Label htmlFor="warehouse">
                {t('warehouse')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.warehouseCode}
                onValueChange={(value) => setFormData({ ...formData, warehouseCode: value })}
              >
                <SelectTrigger className={formErrors.warehouseCode ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('select_warehouse')} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.code} value={warehouse.code}>
                      {warehouse.code} - {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.warehouseCode && (
                <p className="text-sm text-destructive mt-1">{formErrors.warehouseCode}</p>
              )}
            </div>

            {/* Location Type */}
            <div>
              <Label htmlFor="locationType">
                {t('location_type')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.locationType}
                onValueChange={(value: any) => setFormData({ ...formData, locationType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Storage">{t('location_type_storage')}</SelectItem>
                  <SelectItem value="Picking">{t('location_type_picking')}</SelectItem>
                  <SelectItem value="Receiving">{t('location_type_receiving')}</SelectItem>
                  <SelectItem value="Shipping">{t('location_type_shipping')}</SelectItem>
                  <SelectItem value="Other">{t('location_type_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label>{t('status')}</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t('active')}</SelectItem>
                  <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allowed Goods Type */}
            <div>
              <Label>{t('allowed_goods_type')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('allowed_goods_type_note')}</p>
              <MultiSelect
                options={goodsTypes
                  .filter((gt) => !formData.restrictedGoodsType?.includes(gt.code))
                  .map((gt) => ({
                    value: gt.code,
                    label: gt.code,
                    fullLabel: `${gt.code} - ${gt.name}`,
                  }))}
                selected={formData.allowedGoodsType || []}
                onChange={(selected) => setFormData({ ...formData, allowedGoodsType: selected })}
                placeholder={t('all_goods_types')}
                searchPlaceholder={t('search_goods_type')}
                emptyText={t('no_goods_type_found')}
                error={!!formErrors.goodsType}
                className="mt-2"
              />
              {formErrors.goodsType && (
                <p className="text-sm text-destructive mt-1">{formErrors.goodsType}</p>
              )}
            </div>

            {/* Restricted Goods Type */}
            <div>
              <Label>{t('restricted_goods_type')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('restricted_goods_type_note')}</p>
              <MultiSelect
                options={goodsTypes
                  .filter((gt) => !formData.allowedGoodsType?.includes(gt.code))
                  .map((gt) => ({
                    value: gt.code,
                    label: gt.code,
                    fullLabel: `${gt.code} - ${gt.name}`,
                  }))}
                selected={formData.restrictedGoodsType || []}
                onChange={(selected) => setFormData({ ...formData, restrictedGoodsType: selected })}
                placeholder={t('none')}
                searchPlaceholder={t('search_goods_type')}
                emptyText={t('no_goods_type_found')}
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('cancel')}
            </Button>
            <Button onClick={() => handleSave(false)}>{t('save')}</Button>
            <Button onClick={() => handleSave(true)}>{t('save_close')}</Button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{t('location')}</h1>
          <p className="text-muted-foreground">{t('manage_warehouse_locations')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add_new')}
        </Button>
      </div>

      <LocationTable
        columns={columns}
        data={locations}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowDoubleClick={handleView}
        onExport={handleExport}
        warehouseFilter={warehouseFilter}
        onWarehouseFilterChange={setWarehouseFilter}
        locationTypeFilter={locationTypeFilter}
        onLocationTypeFilterChange={setLocationTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        warehouses={warehouses}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('type_code_to_confirm')}: <strong>{itemToDelete?.code}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            placeholder={t('enter_location_code')}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmCode('')}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={confirmCode !== itemToDelete?.code}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_status_change')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('inactive_location_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
