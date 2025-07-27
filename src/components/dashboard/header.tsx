import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/dashboard/user-nav';
import { Icons } from '@/components/icons';
import { NotificationsPopover } from '@/components/dashboard/notifications-popover';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
          <Icons.logo className="h-6 w-6" />
          <span>Project Raseed</span>
        </Link>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        <NotificationsPopover />
        <UserNav />
      </div>
    </header>
  );
}
