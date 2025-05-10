// import {NextAuthOptions} from  "next-auth";
// import CredentialProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs"
// import dbConnect from "@/lib/dbConnect";
// import UserModel from Model;
// import { Model } from "mongoose";

// export const authOptions:NextAuthOptions={
//     providers:[
//         CredentialProvider({
//             id:"credentials",
//             name:"Credentials",
//             credentials:{
//                 email:{label:"Email",type:"text"},
//                 password:{label:"Password",type:"password"}
//             },
//             async authorize(credentials:any):Promise<any>{
//                 await dbConnect();
//                 try{
//                     const user=await UserModel.findOne({
//                         $or:[
//                             {email:credentials.identifier},
//                             {username:credentials.identifier}
//                         ]
//                     })
//                     if(!user){
//                         throw new Error('No user found with this email')
//                     }
//                     const isPasswordCorrect=await bcrypt.compare(credentials.password,user.password);
//                     if(isPasswordCorrect)
//                     {
//                         return user;
//                     }
//                     else {
//                         throw new Error("Incorrect password");
//                     }
//                 }
//                 catch(err:any){
//                     throw new Error(err);
//                 }
//             }
//         })
//     ],
//     callbacks:{
//         async jwt({token,user}){
//             if(user){
//                 token._id=user._id?.toString();
//             }
//             return token;
//         },
//         async session({session,token}){
//             return session;
//         }
//     },
//     pages:{signIn:"/sign-in"},
//     session:{
//         strategy:"jwt",
//     },
//     secret:process.env.AUTH_SECRET,
// }
