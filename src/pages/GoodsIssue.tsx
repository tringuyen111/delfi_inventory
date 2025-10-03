import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

export function GoodsIssue() {
  const { t } = useLanguage();

  const reminders = [
    'Verify pick list quantities before issuing stock.',
    'Capture carrier and tracking references for each delivery.',
    'Confirm that all quality holds are released before shipment.',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('goods_issue')}</CardTitle>
          <CardDescription>
            Manage outbound stock movements, confirm deliveries, and capture proof of shipment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Process overview
            </h3>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              Use this workspace to validate picking requests, prepare shipping documents, and post goods issues to update on-hand
              balances. Workflow automation and integrations can be configured in future iterations.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Daily reminders
            </h3>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {reminders.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
