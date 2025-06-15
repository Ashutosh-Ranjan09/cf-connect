import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  await dbConnect();
  const token = await getToken({ req: request });
  const username = token?.username;
  const cfUser=await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const cfres= await cfUser.json();
    const avatar = cfres.result[0].titlePhoto;
  if (!username) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  const user = await UserModel.findOne({ username: username });
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, isPrivate: user.isPrivate ,avatar:avatar}, { status: 200 });
}

export async function PATCH(request: NextRequest) {
  await dbConnect();

 
  const token = await getToken({ req: request });
  const username = token?.username;
  if (!username) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { isPrivate } = await request.json();
    const updated = await UserModel.findOneAndUpdate(
      { username },
      { isPrivate:!isPrivate },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'private/public toggled', user: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error updating aboutMe:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
