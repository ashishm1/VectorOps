
'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { Icons } from '@/components/icons';
import { LayoutDashboard, Users, Target, LineChart } from 'lucide-react';
import Link from 'next/link';
import { useReceipts } from '@/lib/receipts-context';
import { Badge } from '@/components/ui/badge';
import { ReceiptsProvider } from '@/lib/receipts-context';
import { QuotasProvider } from '@/lib/quotas-context';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { receipts } = useReceipts();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const pendingSettlementsCount = useMemo(() => {
    if (!user || !receipts) return 0;
    
    return receipts.filter(r => 
        r.splitInfo?.payer === user.email &&
        r.splitInfo.participants.some(p => p.email !== user.email && p.status === 'pending')
      ).length;
  }, [receipts, user]);

  if (isAuthenticated !== true || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Icons.logo className="h-6 w-6" />
            <span className="text-lg">Project Raseed</span>
          </Link>
        </SidebarHeader>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/splits'}>
              <Link href="/splits">
                <Users />
                <span>Splits</span>
                {pendingSettlementsCount > 0 && (
                  <Badge variant="secondary" className="ml-auto h-5">{pendingSettlementsCount}</Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/quotas'}>
              <Link href="/quotas">
                <Target />
                <span>Quotas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/details'}>
              <Link href="/details">
                <LineChart />
                <span>History</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReceiptsProvider>
            <QuotasProvider>
              <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </QuotasProvider>
        </ReceiptsProvider>
    )
}
