/*
import { User } from "./Usercontroller";

let GET_ROOM_Id = 1;

export interface Room {
  user1: User;
  user2: User;
}

export class RoomController {
  private room: Map<string, Room>;

  constructor() {
    this.room = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();

    this.room.set(roomId, {
      user1,
      user2,
    });

    user1.socket.emit("send-offer", {
      roomId,
    });

    user2.socket.emit("send-answer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string, senderSocketid: string) {
    const rooms = this.room.get(roomId);

    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;
    receivinguser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const rooms = this.room.get(roomId);

    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;

    receivinguser?.socket.emit("answer", {
      sdp,  
      roomId,
    });
  }

  
  onIceCandidates(
    roomId: string,
    senderSocketid: string,
    candidate: any,
    type: "sender" | "receiver"  
  ) {
    const rooms = this.room.get(roomId);
    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;

    receivinguser.socket.emit("add-ice-candidate", {
      candidate,
      type,
    });
  }

  generate() {
    return GET_ROOM_Id++;
  }
}
*/
import { User } from "./Usercontroller";

let GET_ROOM_Id = 1;

export interface Room {
  user1: User;
  user2: User;
}

export class RoomController {
  private room: Map<string, Room>;

  constructor() {
    this.room = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();

    this.room.set(roomId, {
      user1,
      user2,
    });

    user1.socket.emit("send-offer", {
      roomId,
    });

    user2.socket.emit("send-answer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string, senderSocketid: string) {
    const rooms = this.room.get(roomId);

    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;
    receivinguser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const rooms = this.room.get(roomId);

    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;

    receivinguser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidates(
    roomId: string,
    senderSocketid: string,
    candidate: any,
    type: "sender" | "receiver"
  ) {
    const rooms = this.room.get(roomId);
    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;

    receivinguser.socket.emit("add-ice-candidate", {
      candidate,
      type,
    });
  }

 
  onChatMessage(roomId: string, senderSocketid: string, message: string, senderName: string) {
    const rooms = this.room.get(roomId);
    if (!rooms) {
      return;
    }

    const receivinguser =
      rooms.user1.socket.id === senderSocketid ? rooms.user2 : rooms.user1;

    receivinguser.socket.emit("chat-message", {
      message,
      senderName,
      timestamp: new Date().toISOString(),
    });
  }

  generate() {
    return GET_ROOM_Id++;
  }
}
