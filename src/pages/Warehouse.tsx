import { useState } from 'react';
import { WarehouseTable } from '../components/WarehouseTable';
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
import { toast } from 'sonner@2.0.3';

interface WarehouseData {
  id: string;
  code: string;
  name: string;
  branchCode: string;
  branchName: string;
  address?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  hasLocations?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function Warehouse() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [warehouseToDelete, setWarehouseToDelete] = useState<WarehouseData | null>(null);
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<WarehouseData>>({
    code: '',
    name: '',
    branchCode: '',
    address: '',
    description: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] = useState<'Active' | 'Inactive' | null>(null);

  // Mock data for Branches - In real app, this would come from API
  const branches = [
    { code: 'BR001', name: 'Delfi Tech HQ' },
    { code: 'BR002', name: 'Delfi Tech - Hanoi Branch' },
    { code: 'BR003', name: 'XCloud Central Office' },
  ];

  // Mock data for Warehouses - In real app, this would come from API
  const [warehouseList, setWarehouseList] = useState<WarehouseData[]>([
    {
      id: '1',
      code: 'WH001',
      name: 'Main Warehouse - District 7',
      branchCode: 'BR001',
      branchName: 'Delfi Tech HQ',
      address: '123 Technology Park, District 7, Ho Chi Minh City',
      status: 'Active',
      createdBy: 'System',
      createdAt: '2025-01-01 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-15 14:30:00',
      hasLocations: true,
    },
    {
      id: '2',
      code: 'WH002',
      name: 'Secondary Storage - D7',
      branchCode: 'BR001',
      branchName: 'Delfi Tech HQ',
      address: '456 Industrial Zone, District 7, Ho Chi Minh City',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-05 10:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-05 10:00:00',
      hasLocations: false,
    },
    {
      id: '3',
      code: 'WH003',
      name: 'Hanoi Central Warehouse',
      branchCode: 'BR002',
      branchName: 'Delfi Tech - Hanoi Branch',
      address: '789 Cau Giay District, Hanoi',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-06 09:00:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-20 16:00:00',
      hasLocations: true,
    },
    {
      id: '4',
      code: 'WH004',
      name: 'XCloud Main Storage',
      branchCode: 'BR003',
      branchName: 'XCloud Central Office',
      address: '100 Business Center, Hanoi',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-07 11:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-07 11:00:00',
      hasLocations: false,
    },
    {
      id: '5',
      code: 'WH099',
      name: 'Old Warehouse - Deprecated',
      branchCode: 'BR001',
      branchName: 'Delfi Tech HQ',
      address: '999 Old Street, District 1, Ho Chi Minh City',
      status: 'Inactive',
      createdBy: 'Admin',
      createdAt: '2024-06-15 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2024-12-31 23:59:00',
      hasLocations: false,
    },
  ]);

  const columns = [
    { key: 'code', label: t('warehouse_code'), sortable: true },
    { key: 'name', label: t('warehouse_name'), sortable: true },
    { key: 'branchName', label: t('branch'), sortable: true },
    { key: 'address', label: t('address'), sortable: false },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'updatedAt', label: t('updated_at'), sortable: true },
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('warehouse_code_required');
    } else if (
      viewMode === 'create' &&
      warehouseList.some((wh) => wh.code === formData.code)
    ) {
      errors.code = t('warehouse_code_exists');
    }

    if (!formData.name?.trim()) {
      errors.name = t('warehouse_name_required');
    }

    if (!formData.branchCode) {
      errors.branchCode = t('branch_required');
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

    const selectedBranch = branches.find((br) => br.code === formData.branchCode);

    if (viewMode === 'create') {
      const newWarehouse: WarehouseData = {
        id: String(warehouseList.length + 1),
        code: formData.code!,
        name: formData.name!,
        branchCode: formData.branchCode!,
        branchName: selectedBranch?.name || '',
        address: formData.address,
        description: formData.description,
        status: formData.status as 'Active' | 'Inactive',
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toLocaleString(),
        hasLocations: false,
      };
      setWarehouseList([...warehouseList, newWarehouse]);
      toast.success('Warehouse created successfully');
    } else if (viewMode === 'edit' && selectedWarehouse) {
      const updatedList = warehouseList.map((wh) =>
        wh.id === selectedWarehouse.id
          ? {
              ...wh,
              name: formData.name!,
              branchCode: formData.branchCode!,
              branchName: selectedBranch?.name || '',
              address: formData.address,
              description: formData.description,
              status: formData.status as 'Active' | 'Inactive',
              updatedBy: 'Current User',
              updatedAt: new Date().toLocaleString(),
            }
          : wh
      );
      setWarehouseList(updatedList);
      toast.success('Warehouse updated successfully');
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
      branchCode: '',
      address: '',
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedWarehouse(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      branchCode: warehouse.branchCode,
      address: warehouse.address,
      description: warehouse.description,
      status: warehouse.status,
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const warehouse = warehouseList.find((wh) => wh.id === row.id);
    if (warehouse) {
      setSelectedWarehouse(warehouse);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const warehouse = warehouseList.find((wh) => wh.id === row.id);
    if (warehouse) {
      handleEdit(warehouse);
    }
  };

  const handleDeleteClick = (row: any) => {
    const warehouse = warehouseList.find((wh) => wh.id === row.id);
    if (!warehouse) return;
    
    if (warehouse.hasLocations) {
      toast.error(t('cannot_delete_warehouse_referenced'));
      return;
    }
    setWarehouseToDelete(warehouse);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (warehouseToDelete && confirmCode === warehouseToDelete.code) {
      setWarehouseList(warehouseList.filter((wh) => wh.id !== warehouseToDelete.id));
      toast.success('Warehouse deleted successfully');
      setDeleteDialogOpen(false);
      setWarehouseToDelete(null);
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
  const tableData = warehouseList.map((wh) => ({
    ...wh,
    address: wh.address || '-',
  }));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('warehouse')}</h1>
            <p className="text-muted-foreground">{t('manage_warehouse')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        {warehouseList.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">{t('no_warehouse_message')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_warehouse')}
              </Button>
            </div>
          </div>
        ) : (
          <WarehouseTable
            columns={columns}
            data={tableData}
            onView={handleView}
            onEdit={handleEditFromTable}
            onDelete={handleDeleteClick}
            onRowDoubleClick={handleRowDoubleClick}
            onExport={handleExport}
            branchFilter={branchFilter}
            onBranchFilterChange={setBranchFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            branches={branches}
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
                    placeholder={warehouseToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== warehouseToDelete?.code}
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

  if (viewMode === 'detail' && selectedWarehouse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('warehouse_details')}</h1>
            <p className="text-muted-foreground">{t('warehouse_information')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedWarehouse)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('warehouse_code')}</Label>
              <p className="mt-1">{selectedWarehouse.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('warehouse_name')}</Label>
              <p className="mt-1">{selectedWarehouse.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('branch')}</Label>
              <p className="mt-1">
                {selectedWarehouse.branchCode} - {selectedWarehouse.branchName}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div className="mt-1">
                <Badge variant={selectedWarehouse.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedWarehouse.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            {selectedWarehouse.address && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('address')}</Label>
                <p className="mt-1">{selectedWarehouse.address}</p>
              </div>
            )}
            {selectedWarehouse.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('description')}</Label>
                <p className="mt-1">{selectedWarehouse.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedWarehouse.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedWarehouse.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedWarehouse.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedWarehouse.updatedAt}</p>
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
          <h1>{viewMode === 'create' ? t('create_warehouse') : t('edit_warehouse')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new warehouse'
              : 'Edit warehouse information'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Warehouse Code */}
          <div>
            <Label htmlFor="code">
              {t('warehouse_code')} <span className="text-destructive">*</span>
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

          {/* Warehouse Name */}
          <div>
            <Label htmlFor="name">
              {t('warehouse_name')} <span className="text-destructive">*</span>
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

          {/* Branch */}
          <div>
            <Label htmlFor="branch">
              {t('branch')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.branchCode}
              onValueChange={(value) =>
                setFormData({ ...formData, branchCode: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('select_branch')} />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.code} value={branch.code}>
                    {branch.code} - {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.branchCode && (
              <p className="mt-1 text-sm text-destructive">{formErrors.branchCode}</p>
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

          {/* Address */}
          <div className="md:col-span-2">
            <Label htmlFor="address">{t('address')}</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-2"
              rows={2}
            />
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
              {t('inactive_warehouse_confirmation')}
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
