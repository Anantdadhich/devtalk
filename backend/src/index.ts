import {Server, Socket} from "socket.io"
import http from "http"

import { UserController } from "./controllers/Usercontroller";


const server=http.createServer(http);

const io=new Server(server,{
    cors:{
        origin:"*"
    }
});

const userControll=new UserController();

io.on('connection',(socket:Socket)=>{
    console.log("user Connected")
    userControll.addUser("random",socket);
    socket.on("disconnect",()=>{
        console.log("user disconnect");
        userControll.removeUser(socket.id);
    })    


})

server.listen(3000,()=>{
    console.log('listening on 3000 ')
})
