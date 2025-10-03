import { useState } from 'react';
import { ModelGoodsTable } from '../components/ModelGoodsTable';
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
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../components/ui/separator';
import { MultiSelect } from '../components/ui/multi-select';

interface CustomAttribute {
  key: string;
  value: string;
}

interface ModelGoodsData {
  id: string;
  code: string;
  name: string;
  goodsTypeCode: string;
  goodsTypeName: string;
  primaryUoMCode: string;
  primaryUoMName: string;
  allowedUoMs?: string[];
  tracking: 'None' | 'Serial' | 'Lot';
  status: 'Active' | 'Inactive';
  description?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  model?: string;
  variant?: string;
  dimensions?: string;
  netWeight?: string;
  grossWeight?: string;
  customAttributes?: CustomAttribute[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  hasReferences?: boolean;
  hasStock?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function ModelGoods() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<ModelGoodsData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [trackingChangeDialogOpen, setTrackingChangeDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [itemToDelete, setItemToDelete] = useState<ModelGoodsData | null>(null);
  const [goodsTypeFilter, setGoodsTypeFilter] = useState('all');
  const [trackingFilter, setTrackingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<ModelGoodsData>>({
    code: '',
    name: '',
    goodsTypeCode: '',
    primaryUoMCode: '',
    allowedUoMs: [],
    tracking: 'None',
    status: 'Active',
    description: '',
    sku: '',
    barcode: '',
    brand: '',
    model: '',
    variant: '',
    dimensions: '',
    netWeight: '',
    grossWeight: '',
    customAttributes: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] = useState<'Active' | 'Inactive' | null>(null);
  const [pendingTrackingChange, setPendingTrackingChange] = useState<'None' | 'Serial' | 'Lot' | null>(null);
  const [originalTracking, setOriginalTracking] = useState<'None' | 'Serial' | 'Lot'>('None');

  // Mock data for Goods Types
  const goodsTypes = [
    { code: 'FG', name: 'Finished Goods' },
    { code: 'RM', name: 'Raw Material' },
    { code: 'WIP', name: 'Work In Progress' },
    { code: 'SFG', name: 'Semi-Finished Goods' },
    { code: 'CONS', name: 'Consumables' },
  ];

  // Mock data for UoMs - In real app, this would come from UoM module
  const uoms = [
    { code: 'PC', name: 'Piece', isBase: true, group: 'COUNT', status: 'Active', factor: 1 },
    { code: 'BOX', name: 'Box', isBase: false, group: 'COUNT', status: 'Active', factor: 12 },
    { code: 'CTN', name: 'Carton', isBase: false, group: 'COUNT', status: 'Active', factor: 144 },
    { code: 'KG', name: 'Kilogram', isBase: true, group: 'WEIGHT', status: 'Active', factor: 1 },
    { code: 'G', name: 'Gram', isBase: false, group: 'WEIGHT', status: 'Active', factor: 0.001 },
    { code: 'L', name: 'Liter', isBase: true, group: 'VOLUME', status: 'Active', factor: 1 },
    { code: 'ML', name: 'Milliliter', isBase: false, group: 'VOLUME', status: 'Active', factor: 0.001 },
  ];

  // Mock data for Model Goods
  const [modelGoodsList, setModelGoodsList] = useState<ModelGoodsData[]>([
    {
      id: '1',
      code: 'PROD-001',
      name: 'Laptop Dell Latitude 5420',
      goodsTypeCode: 'FG',
      goodsTypeName: 'Finished Goods',
      primaryUoMCode: 'PC',
      primaryUoMName: 'Piece',
      allowedUoMs: ['PC', 'BOX'],
      tracking: 'Serial',
      status: 'Active',
      description: 'Business laptop with Intel Core i7',
      sku: 'DELL-LAT-5420',
      barcode: '1234567890123',
      brand: 'Dell',
      model: 'Latitude 5420',
      createdBy: 'System',
      createdAt: '2025-01-01 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-15 14:30:00',
      hasReferences: true,
      hasStock: true,
    },
    {
      id: '2',
      code: 'MAT-001',
      name: 'Steel Sheet A36',
      goodsTypeCode: 'RM',
      goodsTypeName: 'Raw Material',
      primaryUoMCode: 'KG',
      primaryUoMName: 'Kilogram',
      allowedUoMs: ['KG', 'G'],
      tracking: 'Lot',
      status: 'Active',
      description: 'Carbon steel sheet for manufacturing',
      createdBy: 'Admin',
      createdAt: '2025-01-02 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-02 09:00:00',
      hasReferences: true,
      hasStock: true,
    },
    {
      id: '3',
      code: 'CONS-001',
      name: 'Office Paper A4',
      goodsTypeCode: 'CONS',
      goodsTypeName: 'Consumables',
      primaryUoMCode: 'BOX',
      primaryUoMName: 'Box',
      allowedUoMs: ['PC', 'BOX'],
      tracking: 'None',
      status: 'Active',
      description: 'White A4 paper 80gsm',
      sku: 'PAPER-A4-80',
      brand: 'Double A',
      createdBy: 'Admin',
      createdAt: '2025-01-03 10:00:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-20 16:00:00',
      hasReferences: false,
      hasStock: false,
    },
  ]);

  const columns = [
    { key: 'code', label: t('item_code'), sortable: true },
    { key: 'name', label: t('item_name'), sortable: true },
    { key: 'goodsTypeName', label: t('goods_type'), sortable: true },
    { key: 'primaryUoMName', label: t('primary_uom'), sortable: false },
    { key: 'tracking', label: t('tracking_method'), sortable: true },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'updatedAt', label: t('updated_at'), sortable: true },
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('item_code_required');
    } else if (
      viewMode === 'create' &&
      modelGoodsList.some((item) => item.code === formData.code)
    ) {
      errors.code = t('item_code_exists');
    }

    if (!formData.name?.trim()) {
      errors.name = t('item_name_required');
    }

    if (!formData.goodsTypeCode) {
      errors.goodsTypeCode = t('goods_type_required');
    }

    if (!formData.primaryUoMCode) {
      errors.primaryUoMCode = t('primary_uom_required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusChange = (newStatus: 'Active' | 'Inactive') => {
    if (formData.status === 'Active' && newStatus === 'Inactive') {
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
    }
  };

  const handleTrackingChange = (newTracking: 'None' | 'Serial' | 'Lot') => {
    // If editing and item has stock/history, block certain changes
    if (viewMode === 'edit' && selectedItem?.hasStock) {
      const isBlockedChange = 
        (originalTracking === 'Serial' && newTracking === 'Lot') ||
        (originalTracking === 'Lot' && newTracking === 'Serial') ||
        ((originalTracking === 'Serial' || originalTracking === 'Lot') && newTracking === 'None');
      
      if (isBlockedChange) {
        toast.error(t('cannot_change_tracking'));
        return;
      }
    }

    // If changing tracking, warn user if editing
    if (originalTracking !== newTracking && viewMode === 'edit') {
      setPendingTrackingChange(newTracking);
      setTrackingChangeDialogOpen(true);
    } else {
      setFormData({ ...formData, tracking: newTracking });
    }
  };

  const confirmTrackingChange = () => {
    if (pendingTrackingChange) {
      setFormData({ ...formData, tracking: pendingTrackingChange });
      setTrackingChangeDialogOpen(false);
      setPendingTrackingChange(null);
    }
  };

  const handleSave = (closeAfter: boolean = false) => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    const selectedGoodsType = goodsTypes.find((gt) => gt.code === formData.goodsTypeCode);
    const selectedUoM = uoms.find((u) => u.code === formData.primaryUoMCode);

    if (viewMode === 'create') {
      const newItem: ModelGoodsData = {
        id: String(modelGoodsList.length + 1),
        code: formData.code!,
        name: formData.name!,
        goodsTypeCode: formData.goodsTypeCode!,
        goodsTypeName: selectedGoodsType?.name || '',
        primaryUoMCode: formData.primaryUoMCode!,
        primaryUoMName: selectedUoM?.name || '',
        allowedUoMs: formData.allowedUoMs,
        tracking: formData.tracking!,
        status: formData.status as 'Active' | 'Inactive',
        description: formData.description,
        sku: formData.sku,
        barcode: formData.barcode,
        brand: formData.brand,
        model: formData.model,
        variant: formData.variant,
        dimensions: formData.dimensions,
        netWeight: formData.netWeight,
        grossWeight: formData.grossWeight,
        customAttributes: formData.customAttributes,
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toLocaleString(),
        hasReferences: false,
        hasStock: false,
      };
      setModelGoodsList([...modelGoodsList, newItem]);
      toast.success('Item created successfully');
    } else if (viewMode === 'edit' && selectedItem) {
      const updatedList = modelGoodsList.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              name: formData.name!,
              goodsTypeCode: formData.goodsTypeCode!,
              goodsTypeName: selectedGoodsType?.name || '',
              primaryUoMCode: formData.primaryUoMCode!,
              primaryUoMName: selectedUoM?.name || '',
              allowedUoMs: formData.allowedUoMs,
              tracking: formData.tracking!,
              status: formData.status as 'Active' | 'Inactive',
              description: formData.description,
              sku: formData.sku,
              barcode: formData.barcode,
              brand: formData.brand,
              model: formData.model,
              variant: formData.variant,
              dimensions: formData.dimensions,
              netWeight: formData.netWeight,
              grossWeight: formData.grossWeight,
              customAttributes: formData.customAttributes,
              updatedBy: 'Current User',
              updatedAt: new Date().toLocaleString(),
            }
          : item
      );
      setModelGoodsList(updatedList);
      toast.success('Item updated successfully');
    }

    if (closeAfter) {
      setViewMode('list');
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      goodsTypeCode: '',
      primaryUoMCode: '',
      allowedUoMs: [],
      tracking: 'None',
      status: 'Active',
      description: '',
      sku: '',
      barcode: '',
      brand: '',
      model: '',
      variant: '',
      dimensions: '',
      netWeight: '',
      grossWeight: '',
      customAttributes: [],
    });
    setFormErrors({});
    setSelectedItem(null);
    setOriginalTracking('None');
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (item: ModelGoodsData) => {
    setSelectedItem(item);
    setOriginalTracking(item.tracking);
    setFormData({
      code: item.code,
      name: item.name,
      goodsTypeCode: item.goodsTypeCode,
      primaryUoMCode: item.primaryUoMCode,
      allowedUoMs: item.allowedUoMs || [],
      tracking: item.tracking,
      status: item.status,
      description: item.description,
      sku: item.sku,
      barcode: item.barcode,
      brand: item.brand,
      model: item.model,
      variant: item.variant,
      dimensions: item.dimensions,
      netWeight: item.netWeight,
      grossWeight: item.grossWeight,
      customAttributes: item.customAttributes || [],
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const item = modelGoodsList.find((i) => i.id === row.id);
    if (item) {
      setSelectedItem(item);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const item = modelGoodsList.find((i) => i.id === row.id);
    if (item) {
      handleEdit(item);
    }
  };

  const handleDeleteClick = (row: any) => {
    const item = modelGoodsList.find((i) => i.id === row.id);
    if (!item) return;
    
    if (item.hasReferences) {
      toast.error(t('cannot_delete_model_goods_referenced'));
      return;
    }
    setItemToDelete(item);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && confirmCode === itemToDelete.code) {
      setModelGoodsList(modelGoodsList.filter((item) => item.id !== itemToDelete.id));
      toast.success('Item deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setConfirmCode('');
    } else {
      toast.error('Code does not match');
    }
  };

  const handleRowDoubleClick = (row: any) => {
    handleView(row);
  };

  const handleExport = () => {
    toast.success('Exporting to Excel...');
  };

  const addCustomAttribute = () => {
    setFormData({
      ...formData,
      customAttributes: [...(formData.customAttributes || []), { key: '', value: '' }],
    });
  };

  const removeCustomAttribute = (index: number) => {
    const newAttributes = [...(formData.customAttributes || [])];
    newAttributes.splice(index, 1);
    setFormData({ ...formData, customAttributes: newAttributes });
  };

  const updateCustomAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...(formData.customAttributes || [])];
    newAttributes[index][field] = value;
    setFormData({ ...formData, customAttributes: newAttributes });
  };

  // Get available UoMs based on selected primary UoM
  const getAvailableUoMs = () => {
    if (!formData.primaryUoMCode) return [];
    const primaryUoM = uoms.find((u) => u.code === formData.primaryUoMCode);
    if (!primaryUoM) return [];
    return uoms.filter((u) => u.group === primaryUoM.group && u.status === 'Active');
  };

  // Transform data for table
  const tableData = modelGoodsList;

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('model_goods')}</h1>
            <p className="text-muted-foreground">{t('manage_model_goods')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        <ModelGoodsTable
          columns={columns}
          data={tableData}
          onView={handleView}
          onEdit={handleEditFromTable}
          onDelete={handleDeleteClick}
          onRowDoubleClick={handleRowDoubleClick}
          onExport={handleExport}
          goodsTypeFilter={goodsTypeFilter}
          onGoodsTypeFilterChange={setGoodsTypeFilter}
          trackingFilter={trackingFilter}
          onTrackingFilterChange={setTrackingFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          goodsTypes={goodsTypes}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_confirmation_message')}
                <div className="mt-4">
                  <Label>{t('type_code_to_confirm')}</Label>
                  <Input
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    placeholder={itemToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== itemToDelete?.code}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('model_goods_details')}</h1>
            <p className="text-muted-foreground">{t('model_goods_information')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedItem)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* General Information */}
          <div>
            <h3 className="mb-4">{t('general_information')}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('item_code')}</Label>
                <p className="mt-1">{selectedItem.code}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('item_name')}</Label>
                <p className="mt-1">{selectedItem.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('goods_type')}</Label>
                <p className="mt-1">
                  {selectedItem.goodsTypeCode} - {selectedItem.goodsTypeName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('primary_uom')}</Label>
                <p className="mt-1">
                  {selectedItem.primaryUoMCode} - {selectedItem.primaryUoMName}
                </p>
              </div>
              {selectedItem.allowedUoMs && selectedItem.allowedUoMs.length > 0 && (
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">{t('allowed_uoms')}</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedItem.allowedUoMs.map((uomCode) => {
                      const uom = uoms.find((u) => u.code === uomCode);
                      return (
                        <Badge key={uomCode} variant="outline">
                          {uomCode} - {uom?.name} (×{uom?.factor})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">{t('tracking_type')}</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedItem.tracking === 'None' && t('tracking_none')}
                    {selectedItem.tracking === 'Serial' && t('tracking_serial')}
                    {selectedItem.tracking === 'Lot' && t('tracking_lot')}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('status')}</Label>
                <div className="mt-1">
                  <Badge variant={selectedItem.status === 'Active' ? 'default' : 'secondary'}>
                    {selectedItem.status === 'Active' ? t('active') : t('inactive')}
                  </Badge>
                </div>
              </div>
              {selectedItem.description && (
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">{t('description')}</Label>
                  <p className="mt-1">{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Identification & Attributes */}
          <div>
            <h3 className="mb-4">{t('identification_attributes')}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {selectedItem.sku && (
                <div>
                  <Label className="text-muted-foreground">{t('sku')}</Label>
                  <p className="mt-1">{selectedItem.sku}</p>
                </div>
              )}
              {selectedItem.barcode && (
                <div>
                  <Label className="text-muted-foreground">{t('barcode')}</Label>
                  <p className="mt-1">{selectedItem.barcode}</p>
                </div>
              )}
              {selectedItem.brand && (
                <div>
                  <Label className="text-muted-foreground">{t('brand')}</Label>
                  <p className="mt-1">{selectedItem.brand}</p>
                </div>
              )}
              {selectedItem.model && (
                <div>
                  <Label className="text-muted-foreground">{t('model')}</Label>
                  <p className="mt-1">{selectedItem.model}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Audit Information */}
          <div>
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedItem.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedItem.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedItem.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedItem.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create/Edit Form View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>
            {viewMode === 'create' 
              ? t('create_model_goods') 
              : `${t('edit_model_goods')}${selectedItem?.code ? ` - ${selectedItem.code}` : ''}`}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new item'
              : 'Edit item information'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-8">
        {/* A. General Information */}
        <div>
          <h3 className="mb-4">{t('general_information')}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Item Code */}
            <div>
              <Label htmlFor="code">
                {t('item_code')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={viewMode === 'edit'}
                className="mt-2"
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-destructive">{formErrors.code}</p>
              )}
            </div>

            {/* Item Name */}
            <div>
              <Label htmlFor="name">
                {t('item_name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            {/* Goods Type */}
            <div>
              <Label htmlFor="goodsType">
                {t('goods_type')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.goodsTypeCode}
                onValueChange={(value) =>
                  setFormData({ ...formData, goodsTypeCode: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('select_goods_type')} />
                </SelectTrigger>
                <SelectContent>
                  {goodsTypes.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.code} - {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.goodsTypeCode && (
                <p className="mt-1 text-sm text-destructive">{formErrors.goodsTypeCode}</p>
              )}
            </div>

            {/* Primary UoM */}
            <div>
              <Label htmlFor="primaryUoM">
                {t('primary_uom')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.primaryUoMCode}
                onValueChange={(value) =>
                  setFormData({ ...formData, primaryUoMCode: value, allowedUoMs: [value] })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('select_primary_uom')} />
                </SelectTrigger>
                <SelectContent>
                  {uoms
                    .filter((u) => u.isBase && u.status === 'Active')
                    .map((uom) => (
                      <SelectItem key={uom.code} value={uom.code}>
                        {uom.code} - {uom.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.primaryUoMCode && (
                <p className="mt-1 text-sm text-destructive">{formErrors.primaryUoMCode}</p>
              )}
            </div>

            {/* Allowed UoMs - appears after Primary UoM is selected */}
            {formData.primaryUoMCode && (
              <div className="md:col-span-2">
                <Label>{t('allowed_uoms')}</Label>
                <p className="text-sm text-muted-foreground mb-2">{t('conversions_note')}</p>
                <MultiSelect
                  options={getAvailableUoMs().map((uom) => ({
                    value: uom.code,
                    label: uom.code,
                    fullLabel: uom.code === formData.primaryUoMCode 
                      ? `${uom.code} - ${uom.name} (Primary)`
                      : `${uom.code} - ${uom.name} (${t('conversion_factor')}: ×${uom.factor})`,
                    disabled: uom.code === formData.primaryUoMCode,
                    disabledReason: undefined,
                  }))}
                  selected={formData.allowedUoMs || []}
                  onChange={(selected) => setFormData({ ...formData, allowedUoMs: selected })}
                  placeholder="Select UoMs..."
                  searchPlaceholder="Search UoM..."
                  emptyText="No UoM found"
                  className="mt-2"
                />
              </div>
            )}

            {/* Tracking Type */}
            <div>
              <Label htmlFor="tracking">{t('tracking_type')}</Label>
              <Select
                value={formData.tracking}
                onValueChange={(value: 'None' | 'Serial' | 'Lot') => handleTrackingChange(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">{t('tracking_none')}</SelectItem>
                  <SelectItem value="Serial">{t('tracking_serial')}</SelectItem>
                  <SelectItem value="Lot">{t('tracking_lot')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive') => handleStatusChange(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t('active')}</SelectItem>
                  <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={2}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* B. Identification & Attributes */}
        <div>
          <h3 className="mb-4">{t('identification_attributes')}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="sku">{t('sku')}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="barcode">{t('barcode')}</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="brand">{t('brand')}</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="model">{t('model')}</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="variant">{t('variant')}</Label>
              <Input
                id="variant"
                value={formData.variant}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">{t('dimensions')}</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 10 × 20 × 30 cm"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="netWeight">{t('net_weight')}</Label>
              <Input
                id="netWeight"
                value={formData.netWeight}
                onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                placeholder="e.g., 5 kg"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="grossWeight">{t('gross_weight')}</Label>
              <Input
                id="grossWeight"
                value={formData.grossWeight}
                onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                placeholder="e.g., 6 kg"
                className="mt-2"
              />
            </div>

            {/* Custom Attributes */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label>{t('custom_attributes')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomAttribute}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('add_attribute')}
                </Button>
              </div>
              {formData.customAttributes && formData.customAttributes.length > 0 && (
                <div className="space-y-2">
                  {formData.customAttributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={t('attribute_key')}
                        value={attr.key}
                        onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder={t('attribute_value')}
                        value={attr.value}
                        onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCustomAttribute(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setViewMode('list');
              resetForm();
            }}
          >
            {t('cancel')}
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)}>
            {t('save')}
          </Button>
          <Button onClick={() => handleSave(true)}>{t('save_close')}</Button>
        </div>
      </div>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('inactive_model_goods_confirmation')}
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

      {/* Tracking Change Confirmation Dialog */}
      <AlertDialog open={trackingChangeDialogOpen} onOpenChange={setTrackingChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tracking_change_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTrackingChange(null)}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmTrackingChange}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
