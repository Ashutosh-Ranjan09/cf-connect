import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, password } = await request.json();
    const userExist = await UserModel.findOne({
      username,
    });
    if (userExist) {
      console.log('User already exist');
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ username, password: hashPassword });
    await newUser.save();
    return NextResponse.json(
      { success: true, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error signup');
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      {
        status: 500,
      }
    );
  }
}
