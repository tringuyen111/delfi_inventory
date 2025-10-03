import { useLanguage } from '../contexts/LanguageContext';
import { GoodsReceiptTable } from '../components/GoodsReceiptTable';

export function GoodsReceipt() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>{t('goods_receipt_title')}</h1>
        <p className="text-muted-foreground">{t('manage_goods_receipt')}</p>
      </div>

      {/* Table */}
      <GoodsReceiptTable />
    </div>
  );
}
