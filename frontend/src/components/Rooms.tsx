import  { useEffect, useRef, useState } from 'react'

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

