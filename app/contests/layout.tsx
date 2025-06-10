import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { fetchServerData } from '@/lib/server-api';
import { Providers } from '@/app/providers';

export default async function ContestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const handle = session?.user?.name || session?.user?.username;

  // Fetch data from server if user is authenticated
  const serverData = handle ? await fetchServerData(handle) : {};
  // console.log("Contests layout server data:", serverData);

  return <Providers serverData={serverData}>{children}</Providers>;
}
