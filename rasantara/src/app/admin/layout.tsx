import Sidebar from '@/components/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F9F5EB]">
      <Sidebar />
  <main className="flex-1 overflow-y-auto pl-72 pt-28 px-6 lg:px-8">{children}</main>
    </div>
  );
}
