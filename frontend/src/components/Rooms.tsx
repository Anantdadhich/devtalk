/*import  { useEffect, useRef, useState } from 'react'

import { Socket,io } from 'socket.io-client';




type Roomsprops={
 name:string,
localaudiotrack:MediaStreamTrack | null,
localviedotrack:MediaStreamTrack | null,
}

const URL='http://localhost:3000';

export const Rooms = ({name,localaudiotrack,localviedotrack}:Roomsprops) => {
  
   const [lobby,setlobby]=useState(true);

   const [socket,setsocket]=useState<Socket |null>(null);
   const [sendingPC,setsendingPC]=useState<null | RTCPeerConnection>(null);
   const [recevingPC,setrecevingPC]=useState<null |RTCPeerConnection>(null);

   const [remoteaudioTrack,setremoteaudioTrack]=useState<MediaStreamTrack | null>(null);
   const [remotevideoTrack,setremotevideoTrack]=useState<MediaStreamTrack |null>(null);

   const [remotemediastream,setremotemediastream]=useState<MediaStream|null>(null);
    
   const remotevideoref=useRef<HTMLVideoElement>(null);
   const localvideoref=useRef<HTMLVideoElement >(null);

   
   useEffect(()=>{
    const socket=io(URL);

    socket.on('send-offer',async({roomId})=>{
      console.log("sending-offer");
          setlobby(false);
      const pc=new RTCPeerConnection();
      setsendingPC(pc);

      if(localviedotrack){
        console.error("added track")
        console.log(localviedotrack);
        pc.addTrack(localviedotrack);
      }

      if(localaudiotrack){
        console.error("added track");
        console.log(localaudiotrack);
        pc.addTrack(localaudiotrack);
      }
      

      pc.onicecandidate=async(e)=>{
        console.log("revc ice candia")
       if(e.candidate){
        socket.emit("add-ice-candidate",{
          candidate:e.candidate,
          type:"sender",
          roomId
        })
       }
      }


      pc.onnegotiationneeded=async()=>{
        console.log("the nego create sending offer to other browser")
        const sdp=await pc.createOffer();

        pc.setLocalDescription(sdp);
        socket.emit("offer",{
            sdp,
            roomId
        })
      }
    })

    socket.on("offer",async({roomId,remoteSdp})=>{
        setlobby(false);
        //we are creating a offer for another browser 
        const pc=new RTCPeerConnection();
        pc.setRemoteDescription(remoteSdp)

        const sdp=await pc.createAnswer();
        pc.setLocalDescription(sdp);

        
        const stream=new MediaStream();


         if(remotevideoref.current){
            remotevideoref.current.srcObject=stream;
         }
          
         setremotemediastream(stream);
             setrecevingPC(pc);
               //@ts-ignore
              window.pcr=pc ;
              pc.ontrack=(e)=>{
                alert("on track")
                 console.error("inside ontrack");
                 const {track, type} = e;
                 if (type == 'audio') {
                      setremoteaudioTrack(track);
                     //@ts-ignore
                   remotevideoref.current.srcObject.addTrack(track)
                 } else {
                   setremoteaudioTrack(track);
                        //@ts-ignore
                     remotevideoref.current.srcObject.addTrack(track)
                }
                  //@ts-ignore
                 remotevideoref.current.play();

              }

              pc.onicecandidate=async(e)=>{
              if(!e.candidate){
                return;
              }

              console.log("rec ice cand");

              if(e.candidate){
                socket.emit("add-ice-candidate",{
                    candidate:e.candidate,
                    type:"reciever",
                    roomId

                })
              }
              }
         socket.emit("answer",{
            sdp,
            roomId
        });

        setTimeout(()=>{
          const track1=pc.getTransceivers()[0].receiver.track;
          const track2=pc.getTransceivers()[1].receiver.track;
          
          console.log(track1);

          if(track1.kind==='video'){
           setremoteaudioTrack(track2);
            setremotevideoTrack(track1);
        
          }else{
            setremotevideoTrack(track2);
            setremoteaudioTrack(track1);
          }
           //@ts-ignore
          remotevideoref.current.srcObject.addTrack(track1);
               //@ts-ignore
          remotevideoref.current.srcObject.addTrack(track2);
          //@ts-ignore
          remotevideoref.current.play();
         
              
        },5000)
        });

   socket.on("answer",({roomId,sdp:remoteSdp})=>{
      setlobby(false);

      setsendingPC(pc=>{
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      })
      console.log("closed")
   })
    
   socket.on("lobby",()=>{
    setlobby(true);
   })
   

   socket.on("add-ice-candidate",({candidate,type})=>{
    console.log({candidate,type})

    if(type=="sender"){
         setrecevingPC(pc=>{
          if(!pc){
            console.error("no pc")
          }else{
            console.error(pc.ontrack);
          }

          pc?.addIceCandidate(candidate)
          return pc;
         })
    }else{
      setsendingPC(pc=>{
        if(!pc){
          console.error("no poc")
        }else{
          console.error(pc.ontrack);
        }
        pc?.addIceCandidate(candidate)
        return pc;
      })


    }
   })
   setsocket(socket);
   },[name])
     
   useEffect(()=>{
    if(localvideoref.current){
      if(localviedotrack){
        localvideoref.current.srcObject=new MediaStream([localviedotrack]);
        localvideoref.current.play();
      }
    }
   },[localvideoref]);

  return (
     <div>
            <h2>Welcome, {name}</h2>
            <div>
                <h3>Your Video</h3>
                <video ref={localvideoref} autoPlay width={400} height={400} />
            </div>
            <div>
                <h3>Reciever</h3>
                <video ref={remotevideoref} autoPlay  width={400} height={400} />
            </div>
            {lobby && <p>Waiting to connect you to someone...</p>}
        </div>
  )
}
*/

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Loader } from 'lucide-react';

type RoomsProps = {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}

const URL = 'http://localhost:3000';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const Rooms = ({ name, localAudioTrack, localVideoTrack }: RoomsProps) => {
  const [lobby, setLobby] = useState(true);
  //@ts-ignore
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sendingPC, setSendingPC] = useState<RTCPeerConnection | null>(null);
  const [receivingPC, setReceivingPC] = useState<RTCPeerConnection | null>(null);
  const [remoteStream] = useState(new MediaStream());
  
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const socket = io(URL);

    socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socket.on('send-offer', async ({ roomId }) => {
      console.log('Creating and sending offer');
      try {
        setLobby(false);
        const pc = new RTCPeerConnection(configuration);
        

        if (localVideoTrack) {
          pc.addTrack(localVideoTrack);
        }
        if (localAudioTrack) {
          pc.addTrack(localAudioTrack);
        }

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit('add-ice-candidate', {
              candidate,
              type: 'sender',
              roomId
            });
          }
        };

      
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.emit('offer', {
          sdp: offer,
          roomId
        });

        setSendingPC(pc);
      } catch (error) {
        console.error('Error in send-offer:', error);
      }
    });

    socket.on('offer', async ({ roomId, sdp }) => {
      console.log('Received offer, creating answer');
      try {
        setLobby(false);
        const pc = new RTCPeerConnection(configuration);

        pc.ontrack = (event) => {
          console.log('Received track:', event.track.kind);
          const [stream] = event.streams;
          if (stream) {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
              console.log('Set remote video stream');
            }
          }
        };

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit('add-ice-candidate', {
              candidate,
              type: 'receiver',
              roomId
            });
          }
        };

 
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          sdp: answer,
          roomId
        });

        setReceivingPC(pc);
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.on('answer', async ({ sdp }) => {
      console.log('Received answer');
      try {
        if (sendingPC) {
          await sendingPC.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    socket.on('add-ice-candidate', async ({ candidate, type }) => {
      try {
        const pc = type === 'sender' ? receivingPC : sendingPC;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socket.on('lobby', () => {
      setLobby(true);
    });

    setSocket(socket);


    return () => {
      socket.disconnect();
      sendingPC?.close();
      receivingPC?.close();
    };
  }, [localAudioTrack, localVideoTrack]);


  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack]);
      if (localAudioTrack) {
        stream.addTrack(localAudioTrack);
      }
      localVideoRef.current.srcObject = stream;
    }
  }, [localVideoTrack, localAudioTrack]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video bg-gray-800 rounded-lg object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white">
            You ({name})
          </div>
        </div>
        
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full aspect-video bg-gray-800 rounded-lg object-cover"
          />
          {lobby ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white">
                <Loader className="animate-spin h-8 w-8 mx-auto mb-2" />
                <p>Waiting for peer...</p>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white">
              Peer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};