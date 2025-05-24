// app/api/search/users/route.ts
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Get current user for checking relationship status
    const token = await getToken({ req: request });
    const currentUser = token?.username as string;
    
    // Find users matching the query (case insensitive)
    const users = await UserModel.find({
      username: { $regex: query, $options: 'i' }
    }).limit(10);
    
    // If we have a current user, get their data to check relationships
    let currentUserData = null;
    if (currentUser) {
      currentUserData = await UserModel.findOne({ username: currentUser });
    }
    
    // Transform results and include relationship status
    const results = users.map(user => {
      const isFollowing = currentUserData?.following.includes(user.username);
      const hasRequestSent = currentUserData?.requestSent.includes(user.username);
      
      return {
        username: user.username,
        isPrivate: user.isPrivate,
        // Don't send private data like password
        relationshipStatus: isFollowing ? 'following' : hasRequestSent ? 'requested' : 'none'
      };
    });
    
    return NextResponse.json({ success: true, users: results }, { status: 200 });
    
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { success: false, message: 'Error searching users' },
      { status: 500 }
    );
  }
}