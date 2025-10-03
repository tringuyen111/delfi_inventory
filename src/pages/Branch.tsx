import { useState } from 'react';
import { BranchTable } from '../components/BranchTable';
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

interface BranchData {
  id: string;
  code: string;
  name: string;
  organizationCode: string;
  organizationName: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  hasWarehouses?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function Branch() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [branchToDelete, setBranchToDelete] = useState<BranchData | null>(null);
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<BranchData>>({
    code: '',
    name: '',
    organizationCode: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] = useState<'Active' | 'Inactive' | null>(null);

  // Mock data for Organizations - In real app, this would come from API
  const organizations = [
    { code: 'ORG001', name: 'Delfi Technologies Corporation' },
    { code: 'ORG002', name: 'XCloud Solutions Vietnam' },
  ];

  // Mock data for Branches - In real app, this would come from API
  const [branchList, setBranchList] = useState<BranchData[]>([
    {
      id: '1',
      code: 'BR001',
      name: 'Delfi Tech HQ',
      organizationCode: 'ORG001',
      organizationName: 'Delfi Technologies Corporation',
      address: '123 Technology Park, District 7, Ho Chi Minh City',
      phone: '+84 28 1234 5678',
      email: 'hq@delfi-tech.com',
      status: 'Active',
      createdBy: 'System',
      createdAt: '2025-01-01 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-15 14:30:00',
      hasWarehouses: true,
    },
    {
      id: '2',
      code: 'BR002',
      name: 'Delfi Tech - Hanoi Branch',
      organizationCode: 'ORG001',
      organizationName: 'Delfi Technologies Corporation',
      address: '456 Cau Giay, Hanoi',
      phone: '+84 24 9876 5432',
      email: 'hanoi@delfi-tech.com',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-05 10:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-05 10:00:00',
      hasWarehouses: false,
    },
    {
      id: '3',
      code: 'BR003',
      name: 'XCloud Central Office',
      organizationCode: 'ORG002',
      organizationName: 'XCloud Solutions Vietnam',
      address: '789 Business Center, Hanoi',
      phone: '+84 24 3456 7890',
      email: 'central@xcloud.vn',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-06 09:00:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-20 16:00:00',
      hasWarehouses: false,
    },
    {
      id: '4',
      code: 'BR004',
      name: 'Old Branch - Deprecated',
      organizationCode: 'ORG001',
      organizationName: 'Delfi Technologies Corporation',
      address: '100 Old Street, District 1, Ho Chi Minh City',
      status: 'Inactive',
      createdBy: 'Admin',
      createdAt: '2024-06-15 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2024-12-31 23:59:00',
      hasWarehouses: false,
    },
  ]);

  const columns = [
    { key: 'code', label: t('branch_code'), sortable: true },
    { key: 'name', label: t('branch_name'), sortable: true },
    { key: 'organizationName', label: t('organization'), sortable: true },
    { key: 'address', label: t('address'), sortable: false },
    { key: 'phone', label: t('phone'), sortable: false },
    { key: 'email', label: t('email'), sortable: false },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'updatedAt', label: t('updated_at'), sortable: true },
  ];

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('branch_code_required');
    } else if (
      viewMode === 'create' &&
      branchList.some((branch) => branch.code === formData.code)
    ) {
      errors.code = t('branch_code_exists');
    }

    if (!formData.name?.trim()) {
      errors.name = t('branch_name_required');
    }

    if (!formData.organizationCode) {
      errors.organizationCode = t('organization_required');
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = t('invalid_email');
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = t('invalid_phone');
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

    const selectedOrg = organizations.find((org) => org.code === formData.organizationCode);

    if (viewMode === 'create') {
      const newBranch: BranchData = {
        id: String(branchList.length + 1),
        code: formData.code!,
        name: formData.name!,
        organizationCode: formData.organizationCode!,
        organizationName: selectedOrg?.name || '',
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        status: formData.status as 'Active' | 'Inactive',
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toLocaleString(),
        hasWarehouses: false,
      };
      setBranchList([...branchList, newBranch]);
      toast.success('Branch created successfully');
    } else if (viewMode === 'edit' && selectedBranch) {
      const updatedList = branchList.map((branch) =>
        branch.id === selectedBranch.id
          ? {
              ...branch,
              name: formData.name!,
              organizationCode: formData.organizationCode!,
              organizationName: selectedOrg?.name || '',
              address: formData.address,
              phone: formData.phone,
              email: formData.email,
              description: formData.description,
              status: formData.status as 'Active' | 'Inactive',
              updatedBy: 'Current User',
              updatedAt: new Date().toLocaleString(),
            }
          : branch
      );
      setBranchList(updatedList);
      toast.success('Branch updated successfully');
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
      organizationCode: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedBranch(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (branch: BranchData) => {
    setSelectedBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      organizationCode: branch.organizationCode,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      description: branch.description,
      status: branch.status,
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const branch = branchList.find((b) => b.id === row.id);
    if (branch) {
      setSelectedBranch(branch);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const branch = branchList.find((b) => b.id === row.id);
    if (branch) {
      handleEdit(branch);
    }
  };

  const handleDeleteClick = (row: any) => {
    const branch = branchList.find((b) => b.id === row.id);
    if (!branch) return;
    
    if (branch.hasWarehouses) {
      toast.error(t('cannot_delete_branch_referenced'));
      return;
    }
    setBranchToDelete(branch);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (branchToDelete && confirmCode === branchToDelete.code) {
      setBranchList(branchList.filter((branch) => branch.id !== branchToDelete.id));
      toast.success('Branch deleted successfully');
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
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
  const tableData = branchList.map((branch) => ({
    ...branch,
    address: branch.address || '-',
    phone: branch.phone || '-',
    email: branch.email || '-',
  }));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('branch')}</h1>
            <p className="text-muted-foreground">{t('manage_branch')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        {branchList.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">{t('no_branch_message')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_branch')}
              </Button>
            </div>
          </div>
        ) : (
          <BranchTable
            columns={columns}
            data={tableData}
            onView={handleView}
            onEdit={handleEditFromTable}
            onDelete={handleDeleteClick}
            onRowDoubleClick={handleRowDoubleClick}
            onExport={handleExport}
            organizationFilter={organizationFilter}
            onOrganizationFilterChange={setOrganizationFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            organizations={organizations}
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
                    placeholder={branchToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== branchToDelete?.code}
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

  if (viewMode === 'detail' && selectedBranch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('branch_details')}</h1>
            <p className="text-muted-foreground">{t('branch_information')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedBranch)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('branch_code')}</Label>
              <p className="mt-1">{selectedBranch.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('branch_name')}</Label>
              <p className="mt-1">{selectedBranch.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('organization')}</Label>
              <p className="mt-1">
                {selectedBranch.organizationCode} - {selectedBranch.organizationName}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('phone')}</Label>
              <p className="mt-1">{selectedBranch.phone || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('email')}</Label>
              <p className="mt-1">{selectedBranch.email || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div className="mt-1">
                <Badge variant={selectedBranch.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedBranch.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            {selectedBranch.address && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('address')}</Label>
                <p className="mt-1">{selectedBranch.address}</p>
              </div>
            )}
            {selectedBranch.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('description')}</Label>
                <p className="mt-1">{selectedBranch.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedBranch.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedBranch.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedBranch.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedBranch.updatedAt}</p>
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
          <h1>{viewMode === 'create' ? t('create_branch') : t('edit_branch')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new branch'
              : 'Edit branch information'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Branch Code */}
          <div>
            <Label htmlFor="code">
              {t('branch_code')} <span className="text-destructive">*</span>
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

          {/* Branch Name */}
          <div>
            <Label htmlFor="name">
              {t('branch_name')} <span className="text-destructive">*</span>
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

          {/* Organization */}
          <div>
            <Label htmlFor="organization">
              {t('organization')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.organizationCode}
              onValueChange={(value) =>
                setFormData({ ...formData, organizationCode: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('select_organization')} />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.code} value={org.code}>
                    {org.code} - {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.organizationCode && (
              <p className="mt-1 text-sm text-destructive">{formErrors.organizationCode}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-2"
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-destructive">{formErrors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-destructive">{formErrors.email}</p>
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
              {t('inactive_branch_confirmation')}
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
