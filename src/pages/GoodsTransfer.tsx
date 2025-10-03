import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

export function GoodsTransfer() {
  const { t } = useLanguage();

  const workflowSteps = [
    'Select the source warehouse and staging location.',
    'Choose the destination site and confirm transport mode.',
    'Review quantities, packaging, and special handling notes.',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('goods_transfer')}</CardTitle>
          <CardDescription>
            Coordinate inter-warehouse movements and ensure stock arrives accurately and on time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Transfer workflow</h3>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {workflowSteps.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Next steps</h3>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              Detailed transfer orders, approval routing, and shipment tracking will be integrated here. For now, document transfer
              details offline and reconcile balances after arrival.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
