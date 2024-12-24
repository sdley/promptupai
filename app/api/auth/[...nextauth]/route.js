import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';

import User from "@models/user";
import { connectToDB } from "@utils/database";

// console.log({
//     cliendId: process.env.GOOGLE_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET
// })

const handler = NextAuth({
    providers: [
        GoogleProvider({
            cliendId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
            const sessionUser = await User.findOne({
                email: session.user.email
            })
    
            session.user.id = sessionUser._id.toString();
    
            return session;
        },
        async signIn({ profile }){
            try {
                await connectToDB();
    
                // check if a user exists
                const userExists = await User.findOne({
                    email: profile.email
                });
    
                // if not, create a new user
                if (!userExists){
                    await User.create({
                        email: profile.email,
                        username: profile.name.replace(" ", "").toLowerCase(), // making sure, there is no space in the username
                        image: profile.picture
                    });
                }
    
                // serverless -> lambda -> dynamodb
                
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }

    }
})

export {handler as GET, handler as POST };

