// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { fetchServerData } from '@/lib/server-api';
import { Providers } from '@/app/providers';
import UserModel from '@/models/User';


export default async function DashboardLayout({
  children,
params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const session = await getServerSession(authOptions);
  const handle = session?.user?.name || session?.user?.username;
  const {username}=await params;  // Fetch data from server if user is authenticated
  const getUsername=await UserModel.findOne({ username:username});
  if((getUsername&&(!getUsername?.isPrivate||(getUsername?.follower?.includes(handle))))||handle===username){
    const serverData = handle ? await fetchServerData(username) : {};
  // console.log(serverData);
  return <Providers serverData={serverData as any}>{children}</Providers>;
  }
  else{
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile is Private</h1>
          <p className="text-gray-600">You need to follow this user to view their profile.</p>
        </div>
      </div>
    );
  }
  
}
