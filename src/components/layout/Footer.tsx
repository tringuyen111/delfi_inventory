import { useLanguage } from '../../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <p className="text-sm text-muted-foreground">{t('copyright')}</p>
        <p className="text-sm text-muted-foreground">{t('version')}</p>
      </div>
    </footer>
  );
}
