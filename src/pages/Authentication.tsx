import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

export function Authentication() {
  const { t } = useLanguage();

  const roadmapItems = [
    'Single sign-on with corporate identity provider',
    'Multi-factor authentication with configurable factors',
    'Session audit logs and anomaly detection alerts',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('authentication')}</CardTitle>
          <CardDescription>Configure sign-in policies and monitor user access activity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Roadmap</h3>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {roadmapItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Next actions</h3>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              Connect this module to your identity platform to enable policy enforcement. Until then, use administrative tools
              to manage user provisioning manually.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
