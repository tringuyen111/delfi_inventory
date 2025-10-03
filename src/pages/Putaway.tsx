import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

export function Putaway() {
  const { t } = useLanguage();

  const focusAreas = [
    'Assign optimal storage locations based on volume and turnover.',
    'Confirm lot, batch, or serial data during placement.',
    'Capture exceptions such as damaged goods or quantity discrepancies.',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('putaway')}</CardTitle>
          <CardDescription>
            Direct received goods to their final storage locations and document exceptions immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Focus areas</h3>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {focusAreas.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Coming soon</h3>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              Task lists, RF device integration, and travel path optimization will be surfaced in this module as soon as the
              data services are connected.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
