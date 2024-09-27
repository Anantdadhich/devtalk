


import  { useEffect, useRef, useState } from "react";
import { Rooms } from "./Rooms";
import { motion } from "framer-motion";
import {Video,VideoOff} from "lucide-react"

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
<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
  <div className="p-8 max-w-4xl mx-auto relative z-10 w-full">
    <motion.h1
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-6xl md:text-8xl font-bold text-center mb-8"
    >
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-700 to-pink-800">
        DEVTALK
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="text-xl text-center mb-12 text-gray-300"
    >
      Connect with  developers, Grow your network , Share Ideas , Talk with random dev.
    </motion.p>

    {!joined ? (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="relative w-64 h-48 bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={videoref}
              className={`w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`}
            ></video>
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <Video size={48} className="text-gray-500" />
              </div>
            )}
            <button
              onClick={toggleCamera}
              className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition"
            >
              {cameraOn ? <Video /> : <VideoOff />}
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter your name"
          className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-full px-6 py-3 focus:outline-none focus:border-purple-500 transition duration-300"
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={handleJoin}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-800 text-white font-bold rounded-full px-8 py-3 transition duration-300 ease-in-out transform hover:scale-105 hover:from-purple-700 hover:to-pink-600"
        >
          Start Talking
        </button>
      </motion.div>
    ) : (
      <Rooms
        name={name}
        localaudiotrack={localaudiotrack}
        localviedotrack={localvideotrack}
      />
    )}
  </div>

  <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
</div>

  );
};

export default Landing;