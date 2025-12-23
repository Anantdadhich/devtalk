/*import { useEffect, useRef, useState } from "react";
import { Rooms } from "./Rooms";
import { motion } from "framer-motion";
import { Video, VideoOff } from "lucide-react";
import { Globe } from "./globe";

const Landing = () => {
  const [name, setName] = useState("");
  const [localaudiotrack, setlocalaudiotrack] = useState<MediaStreamTrack | null>(null);
  const [localvideotrack, setlocalvideotrack] = useState<MediaStreamTrack | null>(null);
  const videoref = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

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
    if (videoref.current) {
      getCam();
    }
  }, [videoref]);

  const handleJoin = () => {
    if (name && !joined) {
      setJoined(true);
    }
  };

  const toggleCamera = () => {
    if (localvideotrack) {
      localvideotrack.enabled = !localvideotrack.enabled;
      setCameraOn(localvideotrack.enabled);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-950 via-black to-gray-950 text-white overflow-hidden font-mono">

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      

      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl"></div>

      <div className="p-8 max-w-4xl mx-auto relative z-10 w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
        >
          
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold text-center mb-8 relative"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600">
            DEV
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            TALK
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-center mb-16 text-gray-400 font-light tracking-wider"
        >
          Connect with developers • Grow your network • Share Ideas • Talk with random dev
        </motion.p>

        {!joined ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-8 relative"
          >
            <div className="flex justify-center">
              <div className="relative z-10 w-72 h-52 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/30 group hover:border-gray-600/50 transition-all duration-300">
                
                <video
                  ref={videoref}
                  className={`w-full h-full object-cover  z-20 ${cameraOn ? '' : 'hidden'}`}
                ></video>
                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                    <Video size={48} className="text-gray-400 "  />
                  </div>
                )}
                <button
                  onClick={toggleCamera}
                  className="absolute bottom-3 right-3 bg-gray-900/80 p-3 rounded-xl hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm group-hover:scale-105"
                >
                  {cameraOn ? (
                    <Video className="text-blue-400 w-5 h-5" />
                  ) : (
                    <VideoOff className="text-pink-400 w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
                 <Globe className="opacity-40 " />
            <div className="flex flex-col items-center space-y-6">
              <input
                type="text"
                placeholder="Enter your name"
                className="w-72 bg-gray-900/30 text-white border-2 border-gray-800 rounded-xl px-6 py-4 focus:outline-none focus:border-gray-600 transition-all duration-300 backdrop-blur-sm placeholder:text-gray-200 text-center tracking-wide"
                onChange={(e) => setName(e.target.value)}
              />

              <button
                onClick={handleJoin}
                className="group relative w-72 overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-4 transition-all duration-300"
              >
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-gray-800 to-transparent group-hover:translate-x-full transition-transform duration-500"></div>
                <span className="relative font-medium text-gray-300 group-hover:text-white">
                  Start Talking
                </span>
              </button>
            </div>
         
          </motion.div>
        ) : (
          <Rooms
            name={name}
            localAudioTrack={localaudiotrack}
            localVideoTrack={localvideotrack}
          />
        )}
      </div>
    </div>
  );
};

export default Landing;*/

import { useEffect, useRef, useState } from "react";
import { Rooms } from "./Rooms";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, VideoOff, Mic, MicOff, 
  ArrowUpRight, Phone, Check, Activity, Globe, Monitor, Smartphone, 
  Command, TrendingUp
} from "lucide-react";

const Landing = () => {
  const [name, setName] = useState("");
  const [localaudiotrack, setlocalaudiotrack] = useState<MediaStreamTrack | null>(null);
  const [localvideotrack, setlocalvideotrack] = useState<MediaStreamTrack | null>(null);
  const videoref = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
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
    if (videoref.current) {
      getCam();
    }
  }, [videoref]);

  const handleJoin = () => {
    if (name && !joined) {
      setJoined(true);
    }
  };

  const toggleCamera = () => {
    if (localvideotrack) {
      localvideotrack.enabled = !localvideotrack.enabled;
      setCameraOn(localvideotrack.enabled);
    }
  };

  const toggleMic = () => {
    if (localaudiotrack) {
      localaudiotrack.enabled = !localaudiotrack.enabled;
      setMicOn(localaudiotrack.enabled);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name) {
      handleJoin();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white text-black font-sans selection:bg-green-200 overflow-x-hidden">
      
      {!joined ? (
        <>
          {/* Top Navigation */}
          <nav className="flex justify-between items-center px-8 py-6 max-w-[1400px] mx-auto w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-r-full"></div>
              <span className="font-semibold text-lg tracking-tight">DevTalk</span>
            </div>
            
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-black transition-colors">Video Call</a>
              <a href="#" className="hover:text-black transition-colors">Meetings</a>
              <a href="#" className="hover:text-black transition-colors">Conferences</a>
              <a href="#" className="hover:text-black transition-colors">Integration</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm font-semibold hover:underline">Login</button>
              <button className="w-10 h-10 bg-[#4ADE80] rounded-full flex items-center justify-center hover:bg-green-400 transition-colors">
                 <Phone size={18} fill="currentColor" className="text-black" />
              </button>
              <button className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Get Started — It's Free
              </button>
            </div>
          </nav>

          <main className="max-w-[1400px] mx-auto px-6 pt-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Left Column: Typography & Inputs */}
              <div className="pt-8">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center">
                      <TrendingUp size={24} />
                   </div>
                   <div>
                      <h3 className="font-bold text-lg leading-none">Growth</h3>
                      <p className="text-gray-500 text-sm">480% increase in Quality</p>
                   </div>
                </div>

                {/* Big Title */}
                <h1 className="text-[8rem] leading-[0.8] font-serif mb-12 tracking-tighter">
                  DevTalk<span className="font-sans font-light">~</span>
                </h1>

                {/* Functionality Section (Replacing static text) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-xl">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-medium">Join Meeting</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                       Enter your name below to instantly join the dev room. No downloads required.
                    </p>
                    
                    <div className="space-y-3 pt-2">
                       <input
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full border-b-2 border-gray-200 py-2 focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300 text-lg"
                        />
                       <button 
                          onClick={handleJoin}
                          disabled={!name}
                          className="flex items-center gap-2 font-bold text-lg hover:gap-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                       >
                          <span className="border-b border-black pb-0.5">Get Started</span>
                          <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                       </button>
                    </div>
                  </div>

                   <div className="space-y-4 opacity-60">
                    <h3 className="text-2xl font-medium">Schedule Call</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                       Connect, collaborate, and get more done together video meetings.
                    </p>
                    <button className="flex items-center gap-2 font-bold text-sm mt-4">
                          <span className="border-b border-gray-400 pb-0.5">View Calendar</span>
                          <ArrowUpRight size={16} />
                       </button>
                  </div>
                </div>
              </div>

              {/* Right Column: The Composition Grid */}
              <div className="relative h-[600px] w-full hidden md:block">
                  
                  {/* 1. Green Circle (Top Left) */}
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                    className="absolute top-0 left-10 w-48 h-48 bg-[#4ADE80] rounded-full flex flex-col items-center justify-center text-center p-4 z-10 shadow-xl"
                  >
                     <span className="text-5xl font-serif mb-1">98%</span>
                     <span className="text-xs font-medium opacity-80 leading-tight">Successful Call<br/>Rates.</span>
                  </motion.div>

                  {/* 2. Purple Arch (Right - Video Preview) */}
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                    className="absolute top-10 right-0 w-64 h-[28rem] bg-[#7C3AED] rounded-t-[10rem] rounded-b-[10rem] overflow-hidden border-4 border-white shadow-2xl z-0"
                  >
                      {/* Live Video Here */}
                      <div className="w-full h-full relative bg-purple-900">
                          <video
                              ref={videoref}
                              autoPlay
                              playsInline
                              muted
                              className={`w-full h-full object-cover ${cameraOn ? 'opacity-100' : 'opacity-0'}`}
                           />
                           {!cameraOn && (
                              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                <VideoOff size={48} />
                              </div>
                           )}
                           <div className="absolute bottom-6 left-0 right-0 text-center">
                              <span className="bg-black/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                                {name || "You"}
                              </span>
                           </div>
                      </div>
                  </motion.div>

                  {/* 3. Yellow Arch (Bottom Left - Controls) */}
                  <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}
                     className="absolute bottom-20 left-20 w-48 h-72 bg-[#FDE047] rounded-[3rem] p-4 flex flex-col items-center justify-between shadow-lg border-4 border-white z-20"
                  >
                      {/* Fake Phone Header */}
                      <div className="w-full flex justify-between px-2 pt-2 opacity-60">
                         <div className="w-12 h-4 bg-black/10 rounded-full"></div>
                         <div className="w-4 h-4 bg-black/10 rounded-full"></div>
                      </div>

                      {/* Controls UI */}
                      <div className="text-center space-y-4 w-full">
                         <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center overflow-hidden mb-2">
                            {/* User Avatar Placeholder */}
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <span className="text-xl font-bold">ME</span>
                            </div>
                         </div>
                         <h4 className="font-serif text-xl">Setup</h4>
                         
                         <div className="flex justify-center gap-2">
                            <button 
                              onClick={toggleMic}
                              className={`p-3 rounded-full transition-colors ${micOn ? 'bg-white text-black' : 'bg-black text-white'}`}
                            >
                               {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                            </button>
                            <button 
                              onClick={toggleCamera}
                              className={`p-3 rounded-full transition-colors ${cameraOn ? 'bg-white text-black' : 'bg-black text-white'}`}
                            >
                               {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                            </button>
                         </div>
                      </div>

                      {/* Fake Phone Home Bar */}
                      <div className="w-16 h-1 bg-black/20 rounded-full mb-2"></div>
                  </motion.div>

                   {/* 4. White Circle (Bottom Right) */}
                   <motion.div 
                     initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}
                     className="absolute bottom-10 right-48 w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center text-center shadow-xl z-30 border border-gray-100"
                   >
                       <span className="text-4xl font-serif">3M</span>
                       <span className="text-xs font-medium text-gray-500 max-w-[80px]">Active Registered Users.</span>
                   </motion.div>

                   {/* Decorative Stamp */}
                   <div className="absolute top-1/2 -right-8 animate-spin-slow hidden xl:block">
                      <svg viewBox="0 0 100 100" width="100" height="100">
                        <defs>
                          <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                        </defs>
                        <text fontSize="11">
                          <textPath xlinkHref="#circle">
                            • Schedule Meeting • Global Evolution
                          </textPath>
                        </text>
                      </svg>
                   </div>
              </div>
            </div>

            {/* Logo Row */}
            <div className="mt-24 pt-12 border-t border-gray-100 flex flex-wrap justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 gap-8">
               <h3 className="text-2xl font-bold font-serif">Rakuten</h3>
               <h3 className="text-2xl font-bold font-mono">NCR</h3>
               <h3 className="text-2xl font-bold italic">monday<span className="not-italic font-normal">.com</span></h3>
               <h3 className="text-2xl font-bold font-serif">Disney</h3>
               <h3 className="text-2xl font-bold flex items-center gap-2"><Box size={24} fill="black" /> Dropbox</h3>
            </div>
          </main>
          
          {/* Bottom Green Bar */}
          <div className="bg-[#4ADE80] py-4 px-6 overflow-hidden">
             <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center text-sm font-bold gap-4">
                <div className="flex items-center gap-2">
                   <span>Meeting Invites Upto 100+</span>
                   <Activity size={16} />
                </div>
                <div className="flex items-center gap-2">
                   <span>30 Days Trial</span>
                   <ArrowUpRight size={16} />
                </div>
                <div className="flex items-center gap-2">
                   <span>24/7 Support</span>
                   <Activity size={16} />
                </div>
                <div className="flex items-center gap-2">
                   <span>Integrations with 30+ Tools</span>
                   <ArrowUpRight size={16} />
                </div>
                <button className="bg-black text-white px-6 py-2 rounded-full hover:scale-105 transition-transform">
                   Buy Now
                </button>
             </div>
          </div>
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-screen w-full bg-gray-50"
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

// Helper for the logo row icon
const Box = ({ size, fill, className }: any) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill={fill} stroke="none"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={fill ? "white" : "currentColor"} fill="none"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12" stroke={fill ? "white" : "currentColor"} fill="none"></line>
   </svg>
);

export default Landing;