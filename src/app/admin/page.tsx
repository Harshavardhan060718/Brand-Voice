import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch admin status from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin, email')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_admin) {
    redirect('/dashboard');
  }

  return (
    <AdminDashboardClient 
      currentUserEmail={profile.email} 
      currentUserId={user.id} 
    />
  );
}
