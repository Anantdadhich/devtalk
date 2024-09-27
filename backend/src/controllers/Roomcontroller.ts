import { User } from "./Usercontroller";

let GET_ROOM_Id=1;

export interface Room{
user1:User,
user2:User
}

export class RoomController{
   private room:Map<string,Room>

   constructor(){
    this.room=new Map<string,Room>();
   }

    // create the room for users
   createRoom(user1:User,user2:User){
    //just we generate the unique room id here 
     const roomId=this.generate().toString();
     
     this.room.set(roomId.toString(),{
        user1,
        user2,
     }) 
     user1.socket.emit("send-offer",{
        roomId
     })
     user2.socket.emit('send-offer',{
        roomId
     })

     
    }
  
 onOffer(roomId:string,sdp:string,senderSocketid:string){
     const rooms=this.room.get(roomId);
       
     if(!rooms){
         return;
     }

     const receivinguser=rooms.user1.socket.id===senderSocketid ? rooms.user2:rooms.user1
     receivinguser?.socket.emit("offer",{
        sdp,
        roomId
     })
 }

  onAnswer(roomId:string,spd:string,senderSocketid:string){
   const rooms=this.room.get(roomId);

   if(!rooms){
    return;
   }
   const receivinguser=rooms.user1.socket.id===senderSocketid ? rooms.user2:rooms.user1

   receivinguser?.socket.emit("answer",{
    spd,
    roomId
   })

 }

 onIceCandiadtes(roomId:string,senderSocketid:string,candidate:any,type:"sender"|"reciver"){
   const rooms=this.room.get(roomId);
    if(!rooms){
        return;
    }

    const recivinguser=rooms.user1.socket.id ===senderSocketid ? rooms.user2:rooms.user1

    recivinguser.socket.emit("add-ice-candidate",({
        candidate,type
    }))

 }

generate(){
    return GET_ROOM_Id++;
   }
}

