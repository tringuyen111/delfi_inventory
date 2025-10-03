import { useState } from 'react';
import { UoMTable } from '../components/UoMTable';
import { Button } from '../components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';


interface UoMData {
  id: string;
  code: string;
  name: string;
  measurementType: string;
  uomType: 'Base' | 'Alt';
  baseUom?: string;
  conversionFactor?: number;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  isReferenced?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function UoM() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUom, setSelectedUom] = useState<UoMData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [uomToDelete, setUomToDelete] = useState<UoMData | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<UoMData>>({
    code: '',
    name: '',
    measurementType: '',
    uomType: 'Base',
    baseUom: '',
    conversionFactor: undefined,
    description: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock data - In real app, this would come from API
  const [uomList, setUomList] = useState<UoMData[]>([
    {
      id: '1',
      code: 'PCS',
      name: 'Piece',
      measurementType: 'Piece',
      uomType: 'Base',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-10 08:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-10 08:00:00',
      isReferenced: true,
    },
    {
      id: '2',
      code: 'BOX',
      name: 'Box',
      measurementType: 'Piece',
      uomType: 'Alt',
      baseUom: 'PCS',
      conversionFactor: 12,
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-10 08:15:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-10 08:15:00',
    },
    {
      id: '3',
      code: 'KG',
      name: 'Kilogram',
      measurementType: 'Weight',
      uomType: 'Base',
      status: 'Active',
      createdBy: 'User1',
      createdAt: '2025-01-11 10:00:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-11 10:00:00',
    },
    {
      id: '4',
      code: 'G',
      name: 'Gram',
      measurementType: 'Weight',
      uomType: 'Alt',
      baseUom: 'KG',
      conversionFactor: 0.001,
      status: 'Active',
      createdBy: 'User1',
      createdAt: '2025-01-11 10:05:00',
      updatedBy: 'User1',
      updatedAt: '2025-01-11 10:05:00',
    },
    {
      id: '5',
      code: 'L',
      name: 'Liter',
      measurementType: 'Volume',
      uomType: 'Base',
      status: 'Active',
      createdBy: 'Admin',
      createdAt: '2025-01-12 14:00:00',
      updatedBy: 'Admin',
      updatedAt: '2025-01-12 14:00:00',
    },
  ]);

  const measurementTypes = ['Piece', 'Weight', 'Volume', 'Length', 'Area', 'Time'];

  const columns = [
    { key: 'code', label: t('uom_code'), sortable: true },
    { key: 'name', label: t('uom_name'), sortable: true },
    { key: 'measurementType', label: t('measurement_type'), sortable: true },
    { key: 'uomType', label: t('uom_type'), sortable: true },
    { key: 'baseUom', label: t('base_uom'), sortable: false },
    { key: 'conversionFactor', label: t('conversion_factor'), sortable: true },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'updatedAt', label: t('updated_at'), sortable: true },
  ];

  // Get base UoMs for dropdown
  const getBaseUoMs = (measurementType: string) => {
    return uomList.filter(
      (uom) => uom.uomType === 'Base' && uom.measurementType === measurementType
    );
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      errors.code = t('uom_required');
    } else if (
      viewMode === 'create' &&
      uomList.some((uom) => uom.code === formData.code)
    ) {
      errors.code = t('code_must_be_unique');
    }

    if (!formData.name?.trim()) {
      errors.name = t('name_required');
    }

    if (!formData.measurementType) {
      errors.measurementType = t('measurement_type_required');
    }

    if (!formData.uomType) {
      errors.uomType = t('uom_type_required');
    }

    if (formData.uomType === 'Alt') {
      if (!formData.baseUom) {
        errors.baseUom = t('select_base_uom');
      }
      if (!formData.conversionFactor || formData.conversionFactor <= 0) {
        errors.conversionFactor = t('conversion_factor_greater_zero');
      }
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
      const newUom: UoMData = {
        id: String(uomList.length + 1),
        code: formData.code!,
        name: formData.name!,
        measurementType: formData.measurementType!,
        uomType: formData.uomType!,
        baseUom: formData.baseUom,
        conversionFactor: formData.conversionFactor,
        description: formData.description,
        status: formData.status as 'Active' | 'Inactive',
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedBy: 'Current User',
        updatedAt: new Date().toISOString(),
      };
      setUomList([...uomList, newUom]);
      toast.success('UoM created successfully');
    } else if (viewMode === 'edit' && selectedUom) {
      const updatedList = uomList.map((uom) =>
        uom.id === selectedUom.id
          ? {
              ...uom,
              name: formData.name!,
              measurementType: formData.measurementType!,
              uomType: formData.uomType!,
              baseUom: formData.baseUom,
              conversionFactor: formData.conversionFactor,
              description: formData.description,
              status: formData.status as 'Active' | 'Inactive',
              updatedBy: 'Current User',
              updatedAt: new Date().toISOString(),
            }
          : uom
      );
      setUomList(updatedList);
      toast.success('UoM updated successfully');
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
      measurementType: '',
      uomType: 'Base',
      baseUom: '',
      conversionFactor: undefined,
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedUom(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (uom: UoMData) => {
    setSelectedUom(uom);
    setFormData({
      code: uom.code,
      name: uom.name,
      measurementType: uom.measurementType,
      uomType: uom.uomType,
      baseUom: uom.baseUom,
      conversionFactor: uom.conversionFactor,
      description: uom.description,
      status: uom.status,
    });
    setViewMode('edit');
  };

  const handleView = (row: any) => {
    const uom = uomList.find((u) => u.id === row.id);
    if (uom) {
      setSelectedUom(uom);
      setViewMode('detail');
    }
  };

  const handleEditFromTable = (row: any) => {
    const uom = uomList.find((u) => u.id === row.id);
    if (uom) {
      handleEdit(uom);
    }
  };

  const handleDeleteClick = (row: any) => {
    const uom = uomList.find((u) => u.id === row.id);
    if (!uom) return;
    
    if (uom.isReferenced) {
      toast.error(t('cannot_delete_referenced'));
      return;
    }
    setUomToDelete(uom);
    setConfirmCode('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (uomToDelete && confirmCode === uomToDelete.code) {
      setUomList(uomList.filter((uom) => uom.id !== uomToDelete.id));
      toast.success('UoM deleted successfully');
      setDeleteDialogOpen(false);
      setUomToDelete(null);
      setConfirmCode('');
    } else {
      toast.error('Code does not match');
    }
  };

  const handleRowDoubleClick = (row: any) => {
    const uom = uomList.find((u) => u.code === row.code);
    if (uom) {
      handleView(uom);
    }
  };

  const handleExport = () => {
    toast.success('Exporting to Excel...');
  };

  // Transform data for table
  const tableData = uomList.map((uom) => ({
    ...uom,
    baseUom: uom.baseUom || '-',
    conversionFactor: uom.conversionFactor ? String(uom.conversionFactor) : '-',
  }));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('uom')}</h1>
            <p className="text-muted-foreground">{t('manage_uom')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>

        {uomList.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">{t('no_uom_message')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_uom')}
              </Button>
            </div>
          </div>
        ) : (
          <UoMTable
            columns={columns}
            data={tableData}
            onView={handleView}
            onEdit={handleEditFromTable}
            onDelete={handleDeleteClick}
            onRowDoubleClick={handleRowDoubleClick}
            onExport={handleExport}
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
                    placeholder={uomToDelete?.code}
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={confirmCode !== uomToDelete?.code}
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

  if (viewMode === 'detail' && selectedUom) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('uom_details')}</h1>
            <p className="text-muted-foreground">View UoM information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              {t('back')}
            </Button>
            <Button onClick={() => handleEdit(selectedUom)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">{t('uom_code')}</Label>
              <p className="mt-1">{selectedUom.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('uom_name')}</Label>
              <p className="mt-1">{selectedUom.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('measurement_type')}</Label>
              <p className="mt-1">{selectedUom.measurementType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('uom_type')}</Label>
              <div className="mt-1">
                <Badge variant={selectedUom.uomType === 'Base' ? 'default' : 'secondary'}>
                  {selectedUom.uomType === 'Base' ? t('base') : t('alt')}
                </Badge>
              </div>
            </div>
            {selectedUom.uomType === 'Alt' && (
              <>
                <div>
                  <Label className="text-muted-foreground">{t('base_uom')}</Label>
                  <p className="mt-1">{selectedUom.baseUom}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('conversion_factor')}</Label>
                  <p className="mt-1">
                    {selectedUom.conversionFactor} × {selectedUom.baseUom}
                  </p>
                </div>
              </>
            )}
            <div>
              <Label className="text-muted-foreground">{t('status')}</Label>
              <div className="mt-1">
                <Badge variant={selectedUom.status === 'Active' ? 'default' : 'secondary'}>
                  {selectedUom.status === 'Active' ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>
            {selectedUom.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">{t('description')}</Label>
                <p className="mt-1">{selectedUom.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4">{t('audit_information')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">{t('created_by')}</Label>
                <p className="mt-1">{selectedUom.createdBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('created_at')}</Label>
                <p className="mt-1">{selectedUom.createdAt}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_by')}</Label>
                <p className="mt-1">{selectedUom.updatedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('updated_at')}</Label>
                <p className="mt-1">{selectedUom.updatedAt}</p>
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
          <h1>{viewMode === 'create' ? t('create_uom') : t('edit_uom')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a new unit of measurement'
              : 'Edit unit of measurement'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* UoM Code */}
          <div>
            <Label htmlFor="code">
              {t('uom_code')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={viewMode === 'edit'}
              className="mt-2"
            />
            {formErrors.code && (
              <p className="mt-1 text-sm text-destructive">{formErrors.code}</p>
            )}
          </div>

          {/* UoM Name */}
          <div>
            <Label htmlFor="name">
              {t('uom_name')} <span className="text-destructive">*</span>
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

          {/* Measurement Type */}
          <div>
            <Label htmlFor="measurementType">
              {t('measurement_type')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.measurementType}
              onValueChange={(value) =>
                setFormData({ ...formData, measurementType: value, baseUom: '' })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {measurementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(type.toLowerCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.measurementType && (
              <p className="mt-1 text-sm text-destructive">{formErrors.measurementType}</p>
            )}
          </div>

          {/* UoM Type */}
          <div>
            <Label htmlFor="uomType">
              {t('uom_type')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.uomType}
              onValueChange={(value: 'Base' | 'Alt') =>
                setFormData({
                  ...formData,
                  uomType: value,
                  baseUom: value === 'Base' ? '' : formData.baseUom,
                  conversionFactor: value === 'Base' ? undefined : formData.conversionFactor,
                })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select UoM type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Base">{t('base')}</SelectItem>
                <SelectItem value="Alt">{t('alt')}</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.uomType && (
              <p className="mt-1 text-sm text-destructive">{formErrors.uomType}</p>
            )}
          </div>

          {/* Base UoM (only for Alt) */}
          {formData.uomType === 'Alt' && (
            <>
              <div>
                <Label htmlFor="baseUom">
                  {t('base_uom')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.baseUom}
                  onValueChange={(value) => setFormData({ ...formData, baseUom: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select base UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    {getBaseUoMs(formData.measurementType || '').map((uom) => (
                      <SelectItem key={uom.code} value={uom.code}>
                        {uom.code} - {uom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.baseUom && (
                  <p className="mt-1 text-sm text-destructive">{formErrors.baseUom}</p>
                )}
              </div>

              {/* Conversion Factor */}
              <div>
                <Label htmlFor="conversionFactor">
                  {t('conversion_factor')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="conversionFactor"
                  type="number"
                  step="0.001"
                  value={formData.conversionFactor || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conversionFactor: parseFloat(e.target.value),
                    })
                  }
                  className="mt-2"
                />
                {formErrors.conversionFactor && (
                  <p className="mt-1 text-sm text-destructive">
                    {formErrors.conversionFactor}
                  </p>
                )}
              </div>
            </>
          )}

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
