import {
  LayoutDashboard,
  Warehouse,
  Database,
  Package,
  FileText,
  Lock,
  ChevronRight,
  Box,
  PackageCheck,
  PackageMinus,
  ClipboardList,
  ArrowRightLeft,
  PackagePlus,
  Ruler,
  Users,
  Building2,
  GitBranch,
  MapPin,
  Boxes,
  Layers,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from '../ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useLanguage } from '../../contexts/LanguageContext';

export function AppSidebar() {
  const { t } = useLanguage();

  const menuItems = [
    {
      title: t('dashboard'),
      icon: LayoutDashboard,
      href: '#dashboard',
    },
    {
      title: t('warehouse_operations'),
      icon: Warehouse,
      items: [
        { title: t('stock_onhand'), icon: Box, href: '#stock-onhand' },
        { title: t('goods_receipt'), icon: PackageCheck, href: '#goods-receipt' },
        { title: t('goods_issue'), icon: PackageMinus, href: '#goods-issue' },
        { title: t('inventory_count'), icon: ClipboardList, href: '#inventory-count' },
        { title: t('goods_transfer'), icon: ArrowRightLeft, href: '#goods-transfer' },
        { title: t('putaway'), icon: PackagePlus, href: '#putaway' },
      ],
    },
    {
      title: t('master_data'),
      icon: Database,
      items: [
        { title: t('uom'), icon: Ruler, href: '#uom' },
        { title: t('partner'), icon: Users, href: '#partner' },
        { title: t('organization'), icon: Building2, href: '#organization' },
        { title: t('branch'), icon: GitBranch, href: '#branch' },
        { title: t('warehouse'), icon: Warehouse, href: '#warehouse' },
        { title: t('location'), icon: MapPin, href: '#location' },
      ],
    },
    {
      title: t('goods_management'),
      icon: Package,
      items: [
        { title: t('goods_type'), icon: Boxes, href: '#goods-type' },
        { title: t('model_goods'), icon: Layers, href: '#model-goods' },
      ],
    },
    {
      title: t('reports'),
      icon: FileText,
      href: '#reports',
    },
    {
      title: t('authentication'),
      icon: Lock,
      href: '#authentication',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">XCloud Inventory</span>
            <span className="text-xs text-muted-foreground">Management System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.href}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
