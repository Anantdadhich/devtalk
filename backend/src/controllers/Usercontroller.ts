import { Socket } from "socket.io";
import { RoomController } from "./Roomcontroller";


export interface User{
    socket:Socket,
    name:string
}

export class UserController{
  private users:User[];
  private queue:string[];
  private roomManager:RoomController;

  constructor(){
    this.users=[];
    this.queue=[];
    this.roomManager=new RoomController();
  }

  addUser(name:string,socket:Socket){
     
    this.users.push({
        name,socket
    })
    this.queue.push(socket.id);
    socket.emit("looby");
    this.clearqueue();
    this.initHandlers(socket);

  }

   removeUser(socketId:string){
    const user =this.users.find(x=>x.socket.id===socketId)
    
    this.users=this.users.filter(x=>x.socket.id !==socketId)

    this.queue=this.queue.filter(x=>x===socketId)
   }

   clearqueue(){
    console.log("inside q");
    console.log(this.queue.length);

    if(this.queue.length < 2){
        return;
    }

    const id1=this.queue.pop();
    const id2=this.queue.pop();

    console.log("id is" + id1 + " "+id2);

    const user1=this.users.find(x=>x.socket.id===id1);
    const user2=this.users.find(x=>x.socket.id===id2);

    if(!user1 || !user2){
        return ;
    }
     
    console.log("creating");
      //cre
    const room=this.roomManager.createRoom(user1,user2);
    
    this.clearqueue()
   }

   initHandlers(socket:Socket){
    
    socket.on("offer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onOffer(roomId,sdp,socket.id)
    })

        socket.on("answer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onAnswer(roomId,sdp,socket.id)
    })
        socket.on("add-ice-candidate",({roomId,candiadate,type})=>{
            this.roomManager.onIceCandiadtes(roomId,socket.id,candiadate,type)
    })

   }
}