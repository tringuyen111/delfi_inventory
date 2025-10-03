import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, PackageCheck, PackageMinus, Warehouse } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Dashboard() {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('stock_onhand'),
      value: '1,234',
      icon: Package,
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: t('goods_receipt'),
      value: '89',
      icon: PackageCheck,
      change: '+8.2%',
      changeType: 'positive' as const,
    },
    {
      title: t('goods_issue'),
      value: '67',
      icon: PackageMinus,
      change: '-3.1%',
      changeType: 'negative' as const,
    },
    {
      title: t('warehouse'),
      value: '15',
      icon: Warehouse,
      change: '0%',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>{t('dashboard')}</h1>
        <p className="text-muted-foreground">
          Welcome to XCloud Inventory Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : stat.changeType === 'negative'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Goods Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <PackageCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">GR-2025-{String(i).padStart(4, '0')}</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="text-sm font-medium">+{i * 50} items</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Goods Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <PackageMinus className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">GI-2025-{String(i).padStart(4, '0')}</p>
                    <p className="text-xs text-muted-foreground">{i + 2} hours ago</p>
                  </div>
                  <div className="text-sm font-medium">-{i * 30} items</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
