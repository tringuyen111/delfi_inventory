import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

export function Reports() {
  const { t } = useLanguage();

  const plannedReports = [
    'Daily warehouse performance dashboard',
    'Inventory valuation snapshot',
    'Aging stock and near-expiry alerts',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('reports')}</CardTitle>
          <CardDescription>
            Centralize operational and financial insights across your inventory network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Planned content</h3>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {plannedReports.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Integration notes</h3>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              Reporting widgets will connect to the analytics service once available. In the interim, use exported data from other
              modules to build temporary dashboards.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
