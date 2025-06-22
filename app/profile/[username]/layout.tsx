// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { fetchServerData } from '@/lib/server-api';
import { Providers } from '@/app/providers';
import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  // params is a Promise in Next.js 15+
  const { username } = await params;
  await dbConnect();
  const dbUser = await UserModel.findOne({ username });
  if (!dbUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-600">This user does not exist in our database.</p>
        </div>
      </div>
    );
  }
  const handle = username;
  // Fetch data from server if user is authenticated
  const serverData = handle ? await fetchServerData(handle) : {};
  // console.log(serverData);

  return <Providers serverData={serverData as any}>{children}</Providers>;
}