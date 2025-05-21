import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function PATCH(request: NextRequest) {
  await dbConnect();

  // Now request is a NextRequest, so getToken({ req: request }) is happy
  const token = await getToken({ req: request });
  const username = token?.username;
  if (!username) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { aboutMe } = await request.json();
    const updated = await UserModel.findOneAndUpdate(
      { username },
      { aboutme: aboutMe },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'About me updated', user: updated },
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
