import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { 
  Loader, Video, VideoOff, Mic, MicOff, PhoneOff, 
  MessageSquare, Send, X, Terminal, Globe, Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RoomsProps = {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
};

interface ChatMessage {
  message: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

const URL = 'http://localhost:3000';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const Rooms = ({ name, localAudioTrack, localVideoTrack }: RoomsProps) => {
  const [lobby, setLobby] = useState(true);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [showControls, setShowControls] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);


  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string>('');
  const sendingPC = useRef<RTCPeerConnection | null>(null);
  const receivingPC = useRef<RTCPeerConnection | null>(null);
  const senderCandidates = useRef<RTCIceCandidate[]>([]);
  const receiverCandidates = useRef<RTCIceCandidate[]>([]);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const localStreamRef = useRef<MediaStream>(new MediaStream());
  
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
 
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack]);
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(e => console.error("Local video play error:", e));
    }
  }, [localVideoTrack, lobby]);

  useEffect(() => {
    const localStream = localStreamRef.current;
    if (localVideoTrack) {
        localStream.getVideoTracks().forEach(track => localStream.removeTrack(track));
        localStream.addTrack(localVideoTrack);
    }
    if (localAudioTrack) {
        localStream.getAudioTracks().forEach(track => localStream.removeTrack(track));
        localStream.addTrack(localAudioTrack);
    }
  }, [localVideoTrack, localAudioTrack]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  useEffect(() => {
    if (showChat && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
  }, [showChat]);

  useEffect(() => {
    const socket = io(URL);
    socketRef.current = socket;

    socket.on('connect', () => console.log('Connected to signaling server'));

    socket.on('send-answer', async ({ roomId }) => {
      roomIdRef.current = roomId;
      try {
        setLobby(false);
        const pc = new RTCPeerConnection(configuration);

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected') setConnectionState('connected');
          else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') setConnectionState('disconnected');
        };

        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.ontrack = (event) => {
          const remoteStream = remoteStreamRef.current;
          remoteStream.addTrack(event.track);
          if (remoteVideoRef.current) {
             remoteVideoRef.current.srcObject = remoteStream;
             remoteVideoRef.current.play().catch(() => {});
          }
        };

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit('add-ice-candidate', { candidate, type: 'receiver', roomId });
        };

        receivingPC.current = pc;
      } catch (error) { console.error(error); }
    });

    socket.on('send-offer', async ({ roomId }) => {
      roomIdRef.current = roomId;
      try {
        setLobby(false);
        const pc = new RTCPeerConnection(configuration);
        sendingPC.current = pc;

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected') setConnectionState('connected');
          else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') setConnectionState('disconnected');
        };

        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.ontrack = (event) => {
          const remoteStream = remoteStreamRef.current;
          remoteStream.addTrack(event.track);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
          }
        };

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit('add-ice-candidate', { candidate, type: 'sender', roomId });
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { sdp: offer, roomId });
      } catch (error) { console.error(error); }
    });

    socket.on('offer', async ({ roomId, sdp }) => {
      try {
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
      } catch (error) { console.error(error); }
    });

    socket.on('answer', async ({ sdp }) => {
      try {
        if (sendingPC.current) {
          await sendingPC.current.setRemoteDescription(new RTCSessionDescription(sdp));
          while (senderCandidates.current.length > 0) {
            const candidate = senderCandidates.current.shift();
            if (candidate) await sendingPC.current.addIceCandidate(candidate);
          }
        }
      } catch (error) { console.error(error); }
    });

    socket.on('add-ice-candidate', async ({ candidate, type }) => {
      try {
        const pc = type === 'sender' ? receivingPC.current : sendingPC.current;
        if (pc && pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        else {
          if (type === 'sender') receiverCandidates.current.push(new RTCIceCandidate(candidate));
          else senderCandidates.current.push(new RTCIceCandidate(candidate));
        }
      } catch (error) { console.error(error); }
    });

    socket.on('chat-message', ({ message, senderName, timestamp }) => {
      setMessages((prev) => [...prev, { message, senderName, timestamp, isOwn: false }]);
      setUnreadCount((prev) => prev + 1);
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
  }, []);

  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

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

  const toggleChat = () => {
    setShowChat(prev => !prev);
    setUnreadCount(0);
  };

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || !socketRef.current || !roomIdRef.current) return;

    const newMessage: ChatMessage = {
      message: trimmedMessage,
      senderName: name,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    socketRef.current.emit('chat-message', { roomId: roomIdRef.current, message: trimmedMessage, senderName: name });
    setMessageInput('');
    chatInputRef.current?.focus();
  };

  const endCall = () => {
    socketRef.current?.disconnect();
    window.location.reload();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
   
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 w-full h-full bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col"
    >
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <nav className="relative z-50 flex justify-between items-center px-6 py-4 flex-none">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/5">
                <Terminal size={18} className="text-white" />
           </div>
           <span className="font-bold text-lg tracking-tight">DevTalk</span>
        </div>
        
        <div className="flex items-center gap-3">
            {lobby && (
                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                     <Loader size={14} className="text-yellow-500 animate-spin" />
                     <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Searching</span>
                </div>
            )}
            {!lobby && connectionState === 'connected' && (
                <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-xs font-bold text-cyan-500 uppercase tracking-wide">Connected</span>
                </div>
            )}
        </div>
      </nav>

      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center p-4 lg:p-6">
        
        <motion.div 
            layout
            className={`relative w-full h-full max-w-[1600px] bg-gray-900/50 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 ${showChat ? 'mr-[400px]' : ''}`}
        >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover opacity-90"
            />

            <AnimatePresence>
                {lobby && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a]"
                    >
                         <div className="relative mb-8">
                             <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.05, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl"
                             />
                             <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                <Globe className="w-10 h-10 text-gray-400" />
                             </div>
                         </div>
                         <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                            Finding a Peer...
                         </h2>
                         <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Matching your stack</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

        {!lobby && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                drag
                dragConstraints={containerRef}
                whileDrag={{ cursor: 'grabbing' }}
                className="absolute bottom-10 right-8 w-56 aspect-video bg-gray-900 rounded-xl shadow-2xl border border-white/20 overflow-hidden z-30 cursor-grab group"
            >
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform scale-x-[-1] ${!localVideoEnabled ? 'opacity-0' : ''}`}
                />
                
                {!localVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                         <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <VideoOff size={18} className="text-gray-400" />
                         </div>
                    </div>
                )}
                
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                    <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                        You
                    </div>
                    {!localAudioEnabled && (
                        <div className="bg-red-500/20 backdrop-blur-md p-1 rounded-full border border-red-500/30">
                             <MicOff size={10} className="text-red-400" />
                        </div>
                    )}
                </div>
            </motion.div>
        )}

        <AnimatePresence>
            {showChat && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="absolute top-4 right-4 bottom-4 w-96 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
                >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} className="text-cyan-400"/>
                            <span className="font-bold text-sm">Live Chat</span>
                        </div>
                        <button 
                            onClick={toggleChat}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                  
                    <div 
                        ref={chatContainerRef} 
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                                <Code2 size={40} strokeWidth={1.5} />
                                <p className="mt-2 text-xs font-mono">Start the collaboration</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-baseline gap-2 mb-1 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <span className="text-[10px] font-bold text-gray-500">{msg.isOwn ? 'You' : msg.senderName}</span>
                                        <span className="text-[10px] text-gray-700">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div className={`
                                        max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed
                                        ${msg.isOwn 
                                            ? 'bg-cyan-600 text-white rounded-tr-sm' 
                                            : 'bg-white/10 border border-white/5 text-gray-200 rounded-tl-sm'}
                                    `}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10">
                        <div className="relative flex items-center">
                            <input
                                ref={chatInputRef}
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-black/50 border border-white/10 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                            />
                            <button 
                                type="submit"
                                disabled={!messageInput.trim()}
                                className="absolute right-2 p-1.5 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 disabled:opacity-0 disabled:scale-90 transition-all"
                            >
                                <Send size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showControls && (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-2 flex items-center gap-3 pointer-events-auto">
                    
                    <button
                        onClick={toggleAudio}
                        className={`p-3.5 rounded-full transition-all duration-200 ${
                            localAudioEnabled 
                                ? 'bg-white/10 text-white hover:bg-white/20' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                    >
                        {localAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-3.5 rounded-full transition-all duration-200 ${
                            localVideoEnabled 
                                ? 'bg-white/10 text-white hover:bg-white/20' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                    >
                        {localVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1"></div>

                    <button
                        onClick={endCall}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-sm transition-all flex items-center gap-2"
                    >
                        <PhoneOff size={16} />
                        <span className="hidden sm:inline">End</span>
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1"></div>

                    <button
                        onClick={toggleChat}
                        className={`relative p-3.5 rounded-full transition-all duration-200 ${
                            showChat
                                ? 'bg-cyan-500 text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        <MessageSquare size={20} />
                        {unreadCount > 0 && !showChat && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1a1a]"></span>
                        )}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};