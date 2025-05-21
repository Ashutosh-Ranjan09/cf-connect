import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { Console } from 'console';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { reciever } = await request.json();
    const token = await getToken({
      req: request, // encryption: true // if you’re using encrypted JWTs
    });

    if (!token?.username) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    const sender = token.username as string;
    const recUser=await UserModel.findOne({username:reciever});
    if(recUser?.isPrivate===false)// test this
    {
      const res1 = await UserModel.findOneAndUpdate(
      { username: sender },
      { $addToSet: { following: reciever } },
      { new: true, runValidators: true }
    );
    const res2 = await UserModel.findOneAndUpdate(
      { username: reciever },
      { $addToSet: { follower: sender } },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, message: 'Following this user' },
      { status: 200 }
    );
    }
    const res1 = await UserModel.findOneAndUpdate(
      { username: sender },
      { $addToSet: { requestSent: reciever } },
      { new: true, runValidators: true }
    );
    const res2 = await UserModel.findOneAndUpdate(
      { username: reciever },
      { $addToSet: { requestRecieved: sender } },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, message: 'Request sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send request');
    return Response.json(
      {
        success: false,
        message: 'Error sending request',
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const token = await getToken({
      req: request, // encryption: true // if you’re using encrypted JWTs
    });

    if (!token?.username) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    const username = token.username as string;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'username query param is required' },
        { status: 400 }
      );
    }

    const res1 = await UserModel.findOne(
      { username: username }
      //   { new: true, runValidators: true }
    );
    console.log('req->', res1);
    if (action === 'sent') {
      return NextResponse.json(
        { success: true, reqRecieved: res1?.requestSent ?? [] },
        { status: 200 }
      );
    } else if (action === 'recieved') {
      return NextResponse.json(
        { success: true, reqRecieved: res1?.requestRecieved ?? [] },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Failed to send request');
    return Response.json(
      {
        success: false,
        message: 'Error sending request',
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    // const url = new URL(request.url);
    // const action = url.searchParams.get('action');
    const {sender}=await request.json();

    const token = await getToken({
      req: request, // encryption: true // if you’re using encrypted JWTs
    });

    if (!token?.username) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    const username = token.username as string;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'username query param is required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne(
  { username: sender, requestSent: { $in: [username] } }
);

if (!user) {
  return NextResponse.json(
    { success: false, message: 'Friend request not found' },
    { status: 404 }
  );
}

// If username exists, update both arrays
const res1 = await UserModel.findOneAndUpdate(
  { username: sender },
  { 
    $pull: { requestSent: username },
    $addToSet: { following:username }
  },
  { new: true, runValidators: true }
);
const res2=await UserModel.findOneAndUpdate({username:username},{
    $pull:{requestRecieved:sender},
    $addToSet:{follower:sender},
},{new :true,runValidators:true});
    // console.log('req->', res1);
        
      return NextResponse.json(
        { success: true, reqRecieved: res2?.requestRecieved ?? [] },
        { status: 200 }
      );
    
  } catch (error) {
    console.error('Failed to send request');
    return Response.json(
      {
        success: false,
        message: 'Error sending request',
      },
      {
        status: 500,
      }
    );
  }
}


export async function DELETE(request: NextRequest) {
  await dbConnect();
  try {
    const 
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const token = await getToken({
      req: request, // encryption: true // if you’re using encrypted JWTs
    });

    if (!token?.username) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    const username = token.username as string;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'username query param is required' },
        { status: 400 }
      );
    }

    const res1 = await UserModel.findOne(
      { username: username }
      //   { new: true, runValidators: true }
    );
    console.log('req->', res1);
    if (action === 'sent') {
      return NextResponse.json(
        { success: true, reqRecieved: res1?.requestSent ?? [] },
        { status: 200 }
      );
    } else if (action === 'recieved') {
      return NextResponse.json(
        { success: true, reqRecieved: res1?.requestRecieved ?? [] },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Failed to send request');
    return Response.json(
      {
        success: false,
        message: 'Error sending request',
      },
      {
        status: 500,
      }
    );
  }
}