import { useState } from 'react';
import { PartnerTable } from '../components/PartnerTable';
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

interface PartnerData {
  id: string;
  code: string;
  name: string;
  partnerType: 'Customer' | 'Supplier' | 'Carrier' | 'Other';
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  isReferenced?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function Partner() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPartner, setSelectedPartner] = useState<PartnerData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [partnerToDelete, setPartnerToDelete] = useState<PartnerData | null>(null);
  const [partnerTypeFilter, setPartnerTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<PartnerData>>({
    code: '',
    name: '',
    partnerType: 'Customer',
    taxCode: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    description: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock data - In real app, this would come from API
  const [partnerList, setPartnerList] = useState<PartnerData[]>([
    {
      id: '1',
      code: 'CUST001',
      name: 'ABC Corporation',
      partnerType: 'Customer',
      taxCode: '0123456789',
      address: '123 Business St, District 1, Ho Chi Minh City',
      phone: '+84 28 1234 5678',
      email: 'contact@abc-corp.com',
      contactPerson: 'John Doe',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-05 09:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-05 09:00:00',
      isReferenced: true,
    },
    {
      id: '2',
      code: 'SUPP001',
      name: 'XYZ Suppliers Ltd',
      partnerType: 'Supplier',
      taxCode: '9876543210',
      address: '456 Industrial Zone, Binh Duong',
      phone: '+84 274 987 6543',
      email: 'sales@xyz-suppliers.com',
      contactPerson: 'Jane Smith',
      status: 'Active',
      createdBy: 'User1',
      createdAt: '2025-01-06 10:30:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-06 10:30:00',
    },
    {
      id: '3',
      code: 'CARR001',
      name: 'Fast Delivery Services',
      partnerType: 'Carrier',
      phone: '+84 90 123 4567',
      email: 'dispatch@fastdelivery.vn',
      contactPerson: 'Michael Brown',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-07 14:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-07 14:00:00',
    },
    {
      id: '4',
      code: 'CUST002',
      name: 'DEF Trading Company',
      partnerType: 'Customer',
      taxCode: '1122334455',
      address: '789 Commerce Ave, Hanoi',
      phone: '+84 24 3456 7890',
      email: 'info@def-trading.com',
      status: 'Inactive',
      createdBy: 'User2',
      createdAt: '2025-01-08 11:00:00',
      updatedBy: 'User2',
      updatedAt: '2025-01-10 16:30:00',
    },
  ]);

  const partnerTypes = ['Customer', 'Supplier', 'Carrier', 'Other'];

  const columns = [
    { key: 'code', label: t('partner_code'), sortable: true },
    { key: 'name', label: t('partner_name'), sortable: true },
    { key: 'partnerType', label: t('partner_type'), sortable: true },
    { key: 'taxCode', label: t('tax_code'), sortable: false },
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
      errors.code = t('partner_code_required');
    } else if (
      viewMode === 'create' &&
      partnerList.some((partner) => partner.code === formData.code)
    ) {
      errors.code = t('partner_code_exists');
    }

    if (!formData.name?.trim()) {
      errors.name = t('partner_name_required');
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

  const handleSave = (closeAfter: boolean = false) => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    if (viewMode === 'create') {
      const newPartner: PartnerData = {
        id: String(partnerList.length + 1),
        code: formData.code!,
        name: formData.name!,
        partnerType: formData.partnerType as 'Customer' | 'Supplier' | 'Carrier' | 'Other',
        taxCode: formData.taxCode,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        contactPerson: formData.contactPerson,
        description: formData.description,
        status: formData.status as 'Active' | 'Inactive',
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toLocaleString(),
      };
      setPartnerList([...partnerList, newPartner]);
      toast.success('Partner created successfully');
    } else if (viewMode === 'edit' && selectedPartner) {
      const updatedList = partnerList.map((partner) =>
        partner.id === selectedPartner.id
          ? {
              ...partner,
              name: formData.name!,
              partnerType: formData.partnerType as 'Customer' | 'Supplier' | 'Carrier' | 'Other',
              taxCode: formData.taxCode,
              address: formData.address,
              phone: formData.phone,
              email: formData.email,
              contactPerson: formData.contactPerson,
              description: formData.description,
              status: formData.status as 'Active' | 'Inactive',
              updatedBy: 'Current User',
              updatedAt: new Date().toLocaleString(),
            }
          : partner
      );
      setPartnerList(updatedList);
      toast.success('Partner updated successfully');
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
      partnerType: 'Customer',
      taxCode: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedPartner(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (partner: PartnerData) => {
    setSelectedPartner(partner);
    setFormData({
      code: partner.code,
      name: partner.name,
      partnerType: partner.partnerType,
      taxCode: partner.taxCode,
      address: partner.address,
      phone: partner.phone,
      email: partner.email,
      contactPerson: partner.contactPerson,
      description: partner.description,
      status: partner.status,
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const partner = partnerList.find((p) => p.id === row.id);
    if (partner) {
      setSelectedPartner(partner);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const partner = partnerList.find((p) => p.id === row.id);
    if (partner) {
      handleEdit(partner);
    }
  };

  const handleDeleteClick = (row: any) => {
    const partner = partnerList.find((p) => p.id === row.id);
    if (!partner) return;
    
    if (partner.isReferenced) {
      toast.error(t('cannot_delete_partner_referenced'));
      return;
    }
    setPartnerToDelete(partner);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (partnerToDelete && confirmCode === partnerToDelete.code) {
      setPartnerList(partnerList.filter((partner) => partner.id !== partnerToDelete.id));
      toast.success('Partner deleted successfully');
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
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
  const tableData = partnerList.map((partner) => ({
    ...partner,
    taxCode: partner.taxCode || '-',
    phone: partner.phone || '-',
    email: partner.email || '-',
  }));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('partner')}</h1>
            <p className="text-muted-foreground">{t('manage_partner')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        {partnerList.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">{t('no_partner_message')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_partner')}
              </Button>
            </div>
          </div>
        ) : (
          <PartnerTable
            columns={columns}
            data={tableData}
            onView={handleView}
            onEdit={handleEditFromTable}
            onDelete={handleDeleteClick}
            onRowDoubleClick={handleRowDoubleClick}
            onExport={handleExport}
            partnerTypeFilter={partnerTypeFilter}
            onPartnerTypeFilterChange={setPartnerTypeFilter}
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
                    placeholder={partnerToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== partnerToDelete?.code}
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

  if (viewMode === 'detail' && selectedPartner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('partner_details')}</h1>
            <p className="text-muted-foreground">{t('partner_information')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedPartner)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('partner_code')}</Label>
              <p className="mt-1">{selectedPartner.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('partner_name')}</Label>
              <p className="mt-1">{selectedPartner.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('partner_type')}</Label>
              <div className="mt-1">
                <Badge>{t(selectedPartner.partnerType.toLowerCase())}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('tax_code')}</Label>
              <p className="mt-1">{selectedPartner.taxCode || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('phone')}</Label>
              <p className="mt-1">{selectedPartner.phone || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('email')}</Label>
              <p className="mt-1">{selectedPartner.email || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('contact_person')}</Label>
              <p className="mt-1">{selectedPartner.contactPerson || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div className="mt-1">
                <Badge variant={selectedPartner.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedPartner.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            {selectedPartner.address && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('address')}</Label>
                <p className="mt-1">{selectedPartner.address}</p>
              </div>
            )}
            {selectedPartner.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('description')}</Label>
                <p className="mt-1">{selectedPartner.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedPartner.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedPartner.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedPartner.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedPartner.updatedAt}</p>
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
          <h1>{viewMode === 'create' ? t('create_partner') : t('edit_partner')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new partner'
              : 'Edit partner information'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Partner Code */}
          <div>
            <Label htmlFor="code">
              {t('partner_code')} <span className="text-destructive">*</span>
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

          {/* Partner Name */}
          <div>
            <Label htmlFor="name">
              {t('partner_name')} <span className="text-destructive">*</span>
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

          {/* Partner Type */}
          <div>
            <Label htmlFor="partnerType">{t('partner_type')}</Label>
            <Select
              value={formData.partnerType}
              onValueChange={(value: 'Customer' | 'Supplier' | 'Carrier' | 'Other') =>
                setFormData({ ...formData, partnerType: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partnerTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(type.toLowerCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Contact Person */}
          <div>
            <Label htmlFor="contactPerson">{t('contact_person')}</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">{t('status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'Active' | 'Inactive') =>
                setFormData({ ...formData, status: value })
              }
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
    </div>
  );
}
