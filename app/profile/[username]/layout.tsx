// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { fetchServerData } from '@/lib/server-api';
import { Providers } from '@/app/providers';

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  // params is a Promise in Next.js 15+
  const { username } = await params;

  const handle = username;
  // Fetch data from server if user is authenticated
  const serverData = handle ? await fetchServerData(handle) : {};
  // console.log(serverData);

  return <Providers serverData={serverData as any}>{children}</Providers>;
}