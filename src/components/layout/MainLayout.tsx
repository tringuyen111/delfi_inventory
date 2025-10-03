import { ReactNode } from 'react';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs: { label: string; href?: string }[];
}

export function MainLayout({ children, breadcrumbs }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header breadcrumbs={breadcrumbs} />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
