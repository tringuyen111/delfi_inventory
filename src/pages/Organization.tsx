import { useState } from 'react';
import { OrganizationTable } from '../components/OrganizationTable';
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

interface OrganizationData {
  id: string;
  code: string;
  name: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  hasBranches?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function Organization() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [organizationToDelete, setOrganizationToDelete] = useState<OrganizationData | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<OrganizationData>>({
    code: '',
    name: '',
    taxCode: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] = useState<'Active' | 'Inactive' | null>(null);

  // Mock data - In real app, this would come from API
  const [organizationList, setOrganizationList] = useState<OrganizationData[]>([
    {
      id: '1',
      code: 'ORG001',
      name: 'Delfi Technologies Corporation',
      taxCode: '0123456789-001',
      address: '123 Technology Park, District 7, Ho Chi Minh City, Vietnam',
      phone: '+84 28 1234 5678',
      email: 'contact@delfi-tech.com',
      status: 'Active',
      createdBy: 'System',
      createdAt: '2025-01-01 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-15 14:30:00',
      hasBranches: true,
    },
    {
      id: '2',
      code: 'ORG002',
      name: 'XCloud Solutions Vietnam',
      taxCode: '9876543210-002',
      address: '456 Business Center, Hanoi, Vietnam',
      phone: '+84 24 9876 5432',
      email: 'info@xcloud.vn',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-05 10:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-05 10:00:00',
      hasBranches: false,
    },
    {
      id: '3',
      code: 'ORG003',
      name: 'Legacy Systems Inc.',
      taxCode: '1122334455-003',
      address: '789 Old Quarter, Hanoi, Vietnam',
      phone: '+84 24 3456 7890',
      email: 'admin@legacy-sys.com',
      status: 'Inactive',
      createdBy: 'User1',
      createdAt: '2024-06-15 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2024-12-31 23:59:00',
      hasBranches: false,
    },
  ]);

  const columns = [
    { key: 'code', label: t('organization_code'), sortable: true },
    { key: 'name', label: t('organization_name'), sortable: true },
    { key: 'taxCode', label: t('tax_code'), sortable: false },
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
      errors.code = t('organization_code_required');
    } else if (
      viewMode === 'create' &&
      organizationList.some((org) => org.code === formData.code)
    ) {
      errors.code = t('organization_code_exists');
    }

    if (!formData.name?.trim()) {
      errors.name = t('organization_name_required');
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

    if (viewMode === 'create') {
      const newOrganization: OrganizationData = {
        id: String(organizationList.length + 1),
        code: formData.code!,
        name: formData.name!,
        taxCode: formData.taxCode,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        status: formData.status as 'Active' | 'Inactive',
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toLocaleString(),
        hasBranches: false,
      };
      setOrganizationList([...organizationList, newOrganization]);
      toast.success('Organization created successfully');
    } else if (viewMode === 'edit' && selectedOrganization) {
      const updatedList = organizationList.map((org) =>
        org.id === selectedOrganization.id
          ? {
              ...org,
              name: formData.name!,
              taxCode: formData.taxCode,
              address: formData.address,
              phone: formData.phone,
              email: formData.email,
              description: formData.description,
              status: formData.status as 'Active' | 'Inactive',
              updatedBy: 'Current User',
              updatedAt: new Date().toLocaleString(),
            }
          : org
      );
      setOrganizationList(updatedList);
      toast.success('Organization updated successfully');
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
      taxCode: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedOrganization(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (organization: OrganizationData) => {
    setSelectedOrganization(organization);
    setFormData({
      code: organization.code,
      name: organization.name,
      taxCode: organization.taxCode,
      address: organization.address,
      phone: organization.phone,
      email: organization.email,
      description: organization.description,
      status: organization.status,
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const organization = organizationList.find((org) => org.id === row.id);
    if (organization) {
      setSelectedOrganization(organization);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const organization = organizationList.find((org) => org.id === row.id);
    if (organization) {
      handleEdit(organization);
    }
  };

  const handleDeleteClick = (row: any) => {
    const organization = organizationList.find((org) => org.id === row.id);
    if (!organization) return;
    
    if (organization.hasBranches) {
      toast.error(t('cannot_delete_organization_referenced'));
      return;
    }
    setOrganizationToDelete(organization);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (organizationToDelete && confirmCode === organizationToDelete.code) {
      setOrganizationList(organizationList.filter((org) => org.id !== organizationToDelete.id));
      toast.success('Organization deleted successfully');
      setDeleteDialogOpen(false);
      setOrganizationToDelete(null);
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
  const tableData = organizationList.map((org) => ({
    ...org,
    taxCode: org.taxCode || '-',
    address: org.address || '-',
    phone: org.phone || '-',
    email: org.email || '-',
  }));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('organization')}</h1>
            <p className="text-muted-foreground">{t('manage_organization')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        {organizationList.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">{t('no_organization_message')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_organization')}
              </Button>
            </div>
          </div>
        ) : (
          <OrganizationTable
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
                    placeholder={organizationToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== organizationToDelete?.code}
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

  if (viewMode === 'detail' && selectedOrganization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('organization_details')}</h1>
            <p className="text-muted-foreground">{t('organization_information')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedOrganization)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('organization_code')}</Label>
              <p className="mt-1">{selectedOrganization.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('organization_name')}</Label>
              <p className="mt-1">{selectedOrganization.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('tax_code')}</Label>
              <p className="mt-1">{selectedOrganization.taxCode || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('phone')}</Label>
              <p className="mt-1">{selectedOrganization.phone || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('email')}</Label>
              <p className="mt-1">{selectedOrganization.email || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div className="mt-1">
                <Badge variant={selectedOrganization.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedOrganization.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            {selectedOrganization.address && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('address')}</Label>
                <p className="mt-1">{selectedOrganization.address}</p>
              </div>
            )}
            {selectedOrganization.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('description')}</Label>
                <p className="mt-1">{selectedOrganization.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedOrganization.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedOrganization.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedOrganization.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedOrganization.updatedAt}</p>
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
          <h1>{viewMode === 'create' ? t('create_organization') : t('edit_organization')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new organization'
              : 'Edit organization information'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Organization Code */}
          <div>
            <Label htmlFor="code">
              {t('organization_code')} <span className="text-destructive">*</span>
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

          {/* Organization Name */}
          <div>
            <Label htmlFor="name">
              {t('organization_name')} <span className="text-destructive">*</span>
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

          {/* Tax Code */}
          <div>
            <Label htmlFor="taxCode">{t('tax_code')}</Label>
            <Input
              id="taxCode"
              value={formData.taxCode}
              onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
              className="mt-2"
            />
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
              {t('inactive_organization_confirmation')}
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
