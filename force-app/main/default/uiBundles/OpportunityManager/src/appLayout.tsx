import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';

// Embedded in an LWC via lightning-ui-embedding: no navigation chrome.
export default function AppLayout() {
  return (
    <main>
      <Outlet />
      <Toaster />
    </main>
  );
}
