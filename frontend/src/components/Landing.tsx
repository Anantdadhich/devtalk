import React, { useEffect, useRef, useState } from "react";
import { Rooms } from "./Rooms"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Globe,

 
  Zap
} from "lucide-react";
import { Spotlight } from "./spotlight"; 

const Landing = () => {

  const [name, setName] = useState("");
  const [localaudiotrack, setlocalaudiotrack] = useState<MediaStreamTrack | null>(null);
  const [localvideotrack, setlocalvideotrack] = useState<MediaStreamTrack | null>(null);
  const videoref = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  //@ts-ignore
  const [cameraOn, setCameraOn] = useState(true);
  //@ts-ignore
  const [micOn, setMicOn] = useState(true);


  const getCam = async () => {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      setlocalaudiotrack(audioTrack);
      setlocalvideotrack(videoTrack);

      if (videoref.current) {
        videoref.current.srcObject = new MediaStream([videoTrack]);
        videoref.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraOn(false);
    }
  };

  useEffect(() => {
    if (videoref.current && !joined) {
      getCam();
    }
  }, [videoref, joined]);

  const handleJoin = () => {
    if (name && !joined) {
      setJoined(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name) {
      handleJoin();
    }
  };


  return (
    <div className="h-screen overflow-hidden  bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden relative">
       
       <Spotlight  />
       
      {!joined ? (
        <>
         
          <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full"></div>
          </div>

      
          <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">
                <Terminal size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight">DevTalk</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-gray-300 font-medium">
              <a href="#" className="hover:text-white transition-colors">Random Match</a>
              <a href="#" className="hover:text-white transition-colors">Communities</a>
              <a href="#" className="hover:text-white transition-colors">Ranking</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm font-medium hover:text-white text-gray-300">Log In</button>
            </div>
          </nav>

         
          <main className="relative z-10 pt-16 pb-32 text-center px-4">
            
         
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium backdrop-blur-sm mb-8"
            >
              <span>1:1 Developer Matching</span>
              <Globe size={12} />
            </motion.div>

            
            <motion.h1 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-7xl md:text-[9rem] font-bold tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 mb-6 relative"
            >
              DEVTALK
            </motion.h1>

            <p className="max-w-xl mx-auto text-gray-400 text-lg mb-10">
              The "Omegle" for Developers. Chat with a random developer.  
No profiles. No follows.  
Just code, bugs, and dev talk.

            </p>

            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="flex flex-col items-center justify-center gap-6 mb-20"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
                  <input 
                      type="text"
                      placeholder="Display Name (e.g. Rustacean)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full sm:flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-black/40 backdrop-blur-md transition-all text-center sm:text-left"
                  />
                  <button 
                      onClick={handleJoin}
                      disabled={!name}
                      className="w-full sm:w-auto px-8 py-4 bg-cyan-200 text-black rounded-full font-bold hover:bg-cyan-100 transition-colors shadow-[0_0_20px_rgba(165,243,252,0.3)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                      Find a Match
                  </button>
              </div>
            </motion.div>

          
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[25%] left-[8%] hidden xl:block"
            >
              <div className="w-64 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">QUEUE</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Avg Match Time</div>
                      <div className="text-xl font-bold text-white font-mono tracking-tight">0.8s</div>
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/5"></div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-zinc-500 font-medium">Trending Stack</span>
                     <div className="flex gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold">RUST</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">TS</span>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>

           
            <motion.div 
  animate={{ y: [0, 15, 0] }}
  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
  className="absolute top-[22%] right-[5%] hidden xl:block"
>
  <div className="w-80 bg-zinc-900/70 border border-white/10 p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">

    
    <div className="mb-3 text-sm font-bold text-white">
      You might talk about
    </div>

   
    <div className="space-y-2 text-xs text-gray-300">
      <div className="border border-white/5 px-2 py-1 bg-black/40">
        worst bug you shipped
      </div>
      <div className="border border-white/5 px-2 py-1 bg-black/40">
        tabs vs spaces (again)
      </div>
      <div className="border border-white/5 px-2 py-1 bg-black/40">
        why prod broke at 3am
      </div>
      <div className="border border-white/5 px-2 py-1 bg-black/40">
        tools you regret choosing
      </div>
      <div className="border border-white/5 px-2 py-1 bg-black/40">
        one thing you hate about your stack
      </div>
    </div>

   
    <div className="mt-4 text-[10px] text-gray-500">
      topics are random every time
    </div>

  </div>
</motion.div>

            
            <div className="relative z-20 max-w-4xl mx-auto bg-black/40 backdrop-blur-md border border-white/5 rounded-full px-12 py-6 flex flex-wrap items-center justify-between gap-8 mb-24">
             <video
              ref={videoref}
              autoPlay
              playsInline
              muted
              className="fixed bottom-4 hidden right-4 w-32 h-20 rounded-lg bg-black/50 border border-white/10 shadow-lg pointer-events-none"
            />
                <div className="text-left">
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-xs text-gray-400">Devs Online</div>
                </div>
                <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>
                <div className="text-left">
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-xs text-gray-400">Matches Made</div>
                </div>
                <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>
                 <div className="text-left">
                    <div className="text-2xl font-bold text-white">50+</div>
                    <div className="text-xs text-gray-400">Countries</div>
                </div>
                 <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
          </main>
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-screen w-full bg-[#0a0a0a]"
          >
            <Rooms
              name={name}
              localAudioTrack={localaudiotrack}
              localVideoTrack={localvideotrack}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Landing;