import { useState } from 'react';
import { GoodsTypeTable } from '../components/GoodsTypeTable';
import { Button } from '../components/ui/button';
import { Plus, Pencil } from 'lucide-react';
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
import { toast } from 'sonner';

interface GoodsTypeData {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  hasReferences?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function GoodsType() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedGoodsType, setSelectedGoodsType] = useState<GoodsTypeData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [goodsTypeToDelete, setGoodsTypeToDelete] = useState<GoodsTypeData | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<GoodsTypeData>>({
    code: '',
    name: '',
    description: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] = useState<'Active' | 'Inactive' | null>(null);

  // Mock data for Goods Types - In real app, this would come from API
  const [goodsTypeList, setGoodsTypeList] = useState<GoodsTypeData[]>([
    {
      id: '1',
      code: 'FG',
      name: 'Finished Goods',
      description: 'Products ready for sale to customers',
      status: 'Active',
      createdBy: 'System',
      createdAt: '2025-01-01 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-15 14:30:00',
      hasReferences: true,
    },
    {
      id: '2',
      code: 'RM',
      name: 'Raw Material',
      description: 'Materials used in the production process',
      status: 'Active',
      createdBy: 'System',
      createdAt: '2025-01-01 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-10 10:00:00',
      hasReferences: true,
    },
    {
      id: '3',
      code: 'WIP',
      name: 'Work In Progress',
      description: 'Products currently being manufactured',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-02 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-02 09:00:00',
      hasReferences: false,
    },
    {
      id: '4',
      code: 'SFG',
      name: 'Semi-Finished Goods',
      description: 'Partially completed products',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-03 10:00:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-20 16:00:00',
      hasReferences: false,
    },
    {
      id: '5',
      code: 'CONS',
      name: 'Consumables',
      description: 'Items consumed in operations',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-04 11:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-04 11:00:00',
      hasReferences: false,
    },
    {
      id: '6',
      code: 'OLD',
      name: 'Obsolete Items',
      description: 'Deprecated goods type - no longer in use',
      status: 'Inactive',
      createdBy: 'Admin',
      createdAt: '2024-06-15 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2024-12-31 23:59:00',
      hasReferences: false,
    },
  ]);

  const columns = [
    { key: 'code', label: t('goods_type_code'), sortable: true },
    { key: 'name', label: t('goods_type_name'), sortable: true },
    { key: 'description', label: t('description'), sortable: false },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'updatedAt', label: t('updated_at'), sortable: true },
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('goods_type_code_required');
    } else if (
      viewMode === 'create' &&
      goodsTypeList.some((gt) => gt.code === formData.code)
    ) {
      errors.code = t('goods_type_code_exists');
    }

    if (!formData.name?.trim()) {
      errors.name = t('goods_type_name_required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusChange = (newStatus: 'Active' | 'Inactive') => {
    // If changing from Active to Inactive, show confirmation
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

  const handleSave = (closeAfter: boolean = false) => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    if (viewMode === 'create') {
      const newGoodsType: GoodsTypeData = {
        id: String(goodsTypeList.length + 1),
        code: formData.code!,
        name: formData.name!,
        description: formData.description,
        status: formData.status as 'Active' | 'Inactive',
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toLocaleString(),
        hasReferences: false,
      };
      setGoodsTypeList([...goodsTypeList, newGoodsType]);
      toast.success('Goods Type created successfully');
    } else if (viewMode === 'edit' && selectedGoodsType) {
      const updatedList = goodsTypeList.map((gt) =>
        gt.id === selectedGoodsType.id
          ? {
              ...gt,
              name: formData.name!,
              description: formData.description,
              status: formData.status as 'Active' | 'Inactive',
              updatedBy: 'Current User',
              updatedAt: new Date().toLocaleString(),
            }
          : gt
      );
      setGoodsTypeList(updatedList);
      toast.success('Goods Type updated successfully');
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
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedGoodsType(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (goodsType: GoodsTypeData) => {
    setSelectedGoodsType(goodsType);
    setFormData({
      code: goodsType.code,
      name: goodsType.name,
      description: goodsType.description,
      status: goodsType.status,
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const goodsType = goodsTypeList.find((gt) => gt.id === row.id);
    if (goodsType) {
      setSelectedGoodsType(goodsType);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const goodsType = goodsTypeList.find((gt) => gt.id === row.id);
    if (goodsType) {
      handleEdit(goodsType);
    }
  };

  const handleDeleteClick = (row: any) => {
    const goodsType = goodsTypeList.find((gt) => gt.id === row.id);
    if (!goodsType) return;
    
    if (goodsType.hasReferences) {
      toast.error(t('cannot_delete_goods_type_referenced'));
      return;
    }
    setGoodsTypeToDelete(goodsType);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (goodsTypeToDelete && confirmCode === goodsTypeToDelete.code) {
      setGoodsTypeList(goodsTypeList.filter((gt) => gt.id !== goodsTypeToDelete.id));
      toast.success('Goods Type deleted successfully');
      setDeleteDialogOpen(false);
      setGoodsTypeToDelete(null);
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

  // Transform data for table
  const tableData = goodsTypeList.map((gt) => ({
    ...gt,
    description: gt.description || '-',
  }));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('goods_type')}</h1>
            <p className="text-muted-foreground">{t('manage_goods_type')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        {goodsTypeList.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">{t('no_goods_type_message')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_goods_type')}
              </Button>
            </div>
          </div>
        ) : (
          <GoodsTypeTable
            columns={columns}
            data={tableData}
            onView={handleView}
            onEdit={handleEditFromTable}
            onDelete={handleDeleteClick}
            onRowDoubleClick={handleRowDoubleClick}
            onExport={handleExport}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}

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
                    placeholder={goodsTypeToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== goodsTypeToDelete?.code}
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

  if (viewMode === 'detail' && selectedGoodsType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('goods_type_details')}</h1>
            <p className="text-muted-foreground">{t('goods_type_information')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedGoodsType)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('goods_type_code')}</Label>
              <p className="mt-1">{selectedGoodsType.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('goods_type_name')}</Label>
              <p className="mt-1">{selectedGoodsType.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div className="mt-1">
                <Badge variant={selectedGoodsType.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedGoodsType.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            {selectedGoodsType.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('description')}</Label>
                <p className="mt-1">{selectedGoodsType.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedGoodsType.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedGoodsType.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedGoodsType.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedGoodsType.updatedAt}</p>
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
          <h1>{viewMode === 'create' ? t('create_goods_type') : t('edit_goods_type')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new goods type'
              : 'Edit goods type information'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Goods Type Code */}
          <div>
            <Label htmlFor="code">
              {t('goods_type_code')} <span className="text-destructive">*</span>
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

          {/* Goods Type Name */}
          <div>
            <Label htmlFor="name">
              {t('goods_type_name')} <span className="text-destructive">*</span>
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
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
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
              {t('inactive_goods_type_confirmation')}
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
