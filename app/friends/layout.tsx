// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchServerData } from '@/lib/server-api';
import { Providers } from '@/app/providers';

export default async function FriendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const handle = session?.user?.name || session?.user?.username;

  // Fetch data from server if user is authenticated
  const serverData = handle ? await fetchServerData(handle) : {};
  // console.log(serverData);
  

  return <Providers serverData={serverData}>{children}</Providers>;
}
