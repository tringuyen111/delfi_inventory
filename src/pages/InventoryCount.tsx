import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

export function InventoryCount() {
  const { t } = useLanguage();

  const preparationSteps = [
    'Generate cycle count tasks and notify assigned users.',
    'Print bin and product labels for manual verification.',
    'Lock locations or items that require recounts until approval.',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory_count')}</CardTitle>
          <CardDescription>
            Plan, execute, and reconcile physical stock counts with system balances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Preparation checklist</h3>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {preparationSteps.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Status</h3>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              Counting workflows will surface here once the service layer is connected. Until then, use this space to brief
              your team on procedures and track manual progress updates.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
