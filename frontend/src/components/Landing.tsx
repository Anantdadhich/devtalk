import { useEffect, useRef, useState } from "react";
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

export default Landing;