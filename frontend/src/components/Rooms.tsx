/*

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Loader } from 'lucide-react';

type RoomsProps = {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
};

const URL = 'http://localhost:3000';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const Rooms = ({ name, localAudioTrack, localVideoTrack }: RoomsProps) => {
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const sendingPC = useRef<RTCPeerConnection | null>(null);
  const receivingPC = useRef<RTCPeerConnection | null>(null);
  const senderCandidates = useRef<RTCIceCandidate[]>([]);
  const receiverCandidates = useRef<RTCIceCandidate[]>([]);
  const [remoteStream] = useState(new MediaStream());
  const [trackCount, setTrackCount] = useState(0);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, trackCount]);

  useEffect(() => {
    const socket = io(URL);

    socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    // RECEIVING SIDE - Will receive offer and send answer
    socket.on('send-answer', async ({ roomId }) => {
      console.log('Received send-answer, preparing to receive offer');
      try {
        setLobby(false);
        const pc = new RTCPeerConnection(configuration);

        pc.oniceconnectionstatechange = () =>
          console.log(`Receiving PC ICE Connection State: ${pc.iceConnectionState}`);
        pc.onicegatheringstatechange = () =>
          console.log(`Receiving PC ICE Gathering State: ${pc.iceGatheringState}`);
        pc.onsignalingstatechange = () =>
          console.log(`Receiving PC Signaling State: ${pc.signalingState}`);

        // CRITICAL: Add tracks BEFORE setting remote description
        if (localVideoTrack) {
          pc.addTrack(localVideoTrack);
          console.log('Added local video track to receiving PC');
        }
        if (localAudioTrack) {
          pc.addTrack(localAudioTrack);
          console.log('Added local audio track to receiving PC');
        }

        pc.ontrack = (event) => {
          console.log('Receiver ontrack:', event.track.kind);
          remoteStream.addTrack(event.track);
          setTrackCount((prev) => prev + 1);
        };

        // FIXED: receiver emits with type 'receiver'
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            console.log('Receiver sending ICE candidate');
            socket.emit('add-ice-candidate', {
              candidate,
              type: 'receiver',
              roomId,
            });
          }
        };

        receivingPC.current = pc;
      } catch (error) {
        console.error('Error in send-answer handler:', error);
      }
    });

    // SENDING SIDE - Creates and sends offer
    socket.on('send-offer', async ({ roomId }) => {
      console.log('Creating and sending offer');
      try {
        setLobby(false);
        const pc = new RTCPeerConnection(configuration);
        sendingPC.current = pc;

        pc.oniceconnectionstatechange = () =>
          console.log(`Sending PC ICE Connection State: ${pc.iceConnectionState}`);
        pc.onicegatheringstatechange = () =>
          console.log(`Sending PC ICE Gathering State: ${pc.iceGatheringState}`);
        pc.onsignalingstatechange = () =>
          console.log(`Sending PC Signaling State: ${pc.signalingState}`);

        // Add tracks before creating offer
        if (localVideoTrack) {
          pc.addTrack(localVideoTrack);
          console.log('Added local video track to sending PC');
        }
        if (localAudioTrack) {
          pc.addTrack(localAudioTrack);
          console.log('Added local audio track to sending PC');
        }

        pc.ontrack = (event) => {
          console.log('Sender received remote track:', event.track.kind);
          remoteStream.addTrack(event.track);
          setTrackCount((prev) => prev + 1);
        };

        // FIXED: sender emits with type 'sender'
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            console.log('Sender sending ICE candidate');
            socket.emit('add-ice-candidate', {
              candidate,
              type: 'sender',
              roomId,
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('offer', {
          sdp: offer,
          roomId,
        });
      } catch (error) {
        console.error('Error in send-offer:', error);
      }
    });

    // Receiving offer (answerer side)
    socket.on('offer', async ({ roomId, sdp }) => {
      console.log('Received offer, creating answer');
      try {
        setLobby(false);
        const pc = receivingPC.current;
        if (!pc) {
          console.error('receivingPC not found');
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log('Set remote description from offer');

        // Process any queued candidates
        while (receiverCandidates.current.length > 0) {
          const candidate = receiverCandidates.current.shift();
          if (candidate) {
            await pc.addIceCandidate(candidate);
            console.log('Added queued receiver ICE candidate');
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          sdp: answer,
          roomId,
        });
        console.log('Sent answer');
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    // Receiving answer (offerer side)
    socket.on('answer', async ({ sdp }) => {
      console.log('Received answer');
      try {
        if (sendingPC.current) {
          await sendingPC.current.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log('Set remote description from answer');

          // Process any queued candidates
          while (senderCandidates.current.length > 0) {
            const candidate = senderCandidates.current.shift();
            if (candidate) {
              await sendingPC.current.addIceCandidate(candidate);
              console.log('Added queued sender ICE candidate');
            }
          }
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    // FIXED: Corrected the type logic - it's reversed from sender's perspective
    socket.on('add-ice-candidate', async ({ candidate, type }) => {
      try {
        console.log(`Received ICE candidate, type: ${type}`);
        // If the other side is 'sender', we are receiver (use receivingPC)
        // If the other side is 'receiver', we are sender (use sendingPC)
        const pc = type === 'sender' ? receivingPC.current : sendingPC.current;
        
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added ICE candidate to ${type === 'sender' ? 'receiving' : 'sending'} PC`);
        } else {
          // Queue the candidate
          if (type === 'sender') {
            receiverCandidates.current.push(new RTCIceCandidate(candidate));
          } else {
            senderCandidates.current.push(new RTCIceCandidate(candidate));
          }
          console.log(`Queued ICE candidate for ${type === 'sender' ? 'receiver' : 'sender'}`);
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
      sendingPC.current?.close();
      receivingPC.current?.close();
    };
  }, [localAudioTrack, localVideoTrack, remoteStream]);

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
*/
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Loader, Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2, Signal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RoomsProps = {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
};

const URL = 'http://localhost:3000';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const Rooms = ({ name, localAudioTrack, localVideoTrack }: RoomsProps) => {
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const sendingPC = useRef<RTCPeerConnection | null>(null);
  const receivingPC = useRef<RTCPeerConnection | null>(null);
  const senderCandidates = useRef<RTCIceCandidate[]>([]);
  const receiverCandidates = useRef<RTCIceCandidate[]>([]);
  const [remoteStream] = useState(new MediaStream());
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [showControls, setShowControls] = useState(true);
  
  // State to track local media status
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track Refs
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Handlers for Toggling Media ---
  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.enabled = !localVideoTrack.enabled;
      setLocalVideoEnabled(localVideoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !localAudioTrack.enabled;
      setLocalAudioEnabled(localAudioTrack.enabled);
    }
  };
  // -----------------------------------

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const endCall = () => {
    socket?.disconnect();
    window.location.reload();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!lobby) setShowControls(false);
    }, 4000);
  };

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle Local Video Ref
  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack]);
      // Note: We don't add audio track here to prevent hearing yourself (feedback loop)
      localVideoRef.current.srcObject = stream;
    }
  }, [localVideoTrack]);

  // WebRTC & Socket Logic
  useEffect(() => {
    const socket = io(URL);
    setSocket(socket);

    socket.on('connect', () => console.log('Connected to signaling server'));

    socket.on('send-answer', async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection(configuration);
      receivingPC.current = pc;

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected') setConnectionState('connected');
        if (pc.iceConnectionState === 'disconnected') setConnectionState('disconnected');
      };

      if (localVideoTrack) pc.addTrack(localVideoTrack);
      if (localAudioTrack) pc.addTrack(localAudioTrack);

      pc.ontrack = (event) => {
        remoteStream.addTrack(event.track);
        // Force update to ensure react sees the stream change
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('add-ice-candidate', { candidate, type: 'receiver', roomId });
      };
    });

    socket.on('send-offer', async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection(configuration);
      sendingPC.current = pc;

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected') setConnectionState('connected');
        if (pc.iceConnectionState === 'disconnected') setConnectionState('disconnected');
      };

      if (localVideoTrack) pc.addTrack(localVideoTrack);
      if (localAudioTrack) pc.addTrack(localAudioTrack);

      pc.ontrack = (event) => {
        remoteStream.addTrack(event.track);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('add-ice-candidate', { candidate, type: 'sender', roomId });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { sdp: offer, roomId });
    });

    socket.on('offer', async ({ roomId, sdp }) => {
      setLobby(false);
      const pc = receivingPC.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      while (receiverCandidates.current.length > 0) {
        const candidate = receiverCandidates.current.shift();
        if (candidate) await pc.addIceCandidate(candidate);
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sdp: answer, roomId });
    });

    socket.on('answer', async ({ sdp }) => {
      if (sendingPC.current) {
        await sendingPC.current.setRemoteDescription(new RTCSessionDescription(sdp));
        while (senderCandidates.current.length > 0) {
          const candidate = senderCandidates.current.shift();
          if (candidate) await sendingPC.current.addIceCandidate(candidate);
        }
      }
    });

    socket.on('add-ice-candidate', async ({ candidate, type }) => {
      const pc = type === 'sender' ? receivingPC.current : sendingPC.current;
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (type === 'sender') receiverCandidates.current.push(new RTCIceCandidate(candidate));
        else senderCandidates.current.push(new RTCIceCandidate(candidate));
      }
    });

    socket.on('lobby', () => {
      setLobby(true);
      setConnectionState('connecting');
    });

    return () => {
      socket.disconnect();
      sendingPC.current?.close();
      receivingPC.current?.close();
    };
  }, [localAudioTrack, localVideoTrack, remoteStream]);


  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans"
    >
      {/* 1. Main Stage (Remote Video or Lobby) */}
      <div className="absolute inset-0 z-0">
        {lobby ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden">
                {/* Lobby UI */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 text-center space-y-6"
                >
                    <div className="relative w-24 h-24 mx-auto">
                        <motion.div 
                            className="absolute inset-0 rounded-full border-4 border-indigo-500/30"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                         <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)]">
                            <Signal className="w-10 h-10 text-white animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-light text-white tracking-tight">Looking for a peer...</h2>
                    <p className="text-zinc-500 max-w-xs mx-auto">Connecting you to a random developer.</p>
                </motion.div>
            </div>
        ) : (
            // Remote Video Feed
            <div className="w-full h-full bg-zinc-900 relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {connectionState === 'connecting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
                    </div>
                )}
            </div>
        )}
      </div>

      {/* 2. Local Video (Floating Picture-in-Picture) */}
      <motion.div 
        drag
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-6 right-6 w-48 aspect-[3/4] sm:w-64 sm:aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-30 cursor-grab active:cursor-grabbing group hover:scale-105 transition-transform duration-300"
      >
         <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform scale-x-[-1] ${!localVideoEnabled ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
         />
         
         <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 border border-white/5">
            <span className="text-xs font-medium text-white">{name} (You)</span>
            {!localAudioEnabled && <MicOff size={12} className="text-red-400" />}
         </div>

         {!localVideoEnabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
               <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                 <VideoOff className="w-5 h-5 text-zinc-500" />
               </div>
               <span className="text-xs text-zinc-500">Camera Off</span>
            </div>
         )}
      </motion.div>

      {/* 3. Floating Control Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
              
              <button 
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-all duration-200 ${
                  localAudioEnabled 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-105' 
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {localAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button 
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all duration-200 ${
                  localVideoEnabled 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-105' 
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {localVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

              <button 
                onClick={endCall}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-red-600/20"
              >
                <PhoneOff size={24} />
              </button>

              <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

              <button 
                onClick={toggleFullscreen}
                className="p-4 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};