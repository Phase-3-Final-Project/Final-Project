import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Sidebar from '@/components/sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('Authorization');

  // Redirect ke login jika user belum login
  if (!authCookie) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#F9F5EB]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-72 pt-28 px-6 lg:px-8">{children}</main>
    </div>
  );
}
