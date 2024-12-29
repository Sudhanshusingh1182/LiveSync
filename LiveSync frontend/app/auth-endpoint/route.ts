import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    auth.protect(); //Ensure the user is authenticated

    const {sessionClaims} = await auth(); //Get the user's claims
    const {room} = await req.json(); //Get the room ID from the request body
    
    const session = liveblocks.prepareSession(sessionClaims?.email!,{
        userInfo: {
            name: sessionClaims?.fullName!,
            email: sessionClaims?.email!,
            avatar: sessionClaims?.image!,
        }
    }); //Prepare the session with the user's claims
    
    const usersInRoom = await adminDb.collectionGroup("rooms").where("userId","==",sessionClaims?.email!).get(); //Check if the user is already in a room
    
    const userInRoom = usersInRoom.docs.find((doc)=> doc.id === room); //Find the user in the room
    
    if(userInRoom?.exists){
        session.allow(room,session.FULL_ACCESS);
        const {body,status}= await session.authorize();
        
        console.log("You are authorised");
        
        
        return new Response(body,{status});
    } else{
        return NextResponse.json(
            {message:"You are not in this room"},
            {status: 403}
        )
    }
}

//2:46:10