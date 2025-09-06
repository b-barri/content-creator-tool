"use client";

import { motion } from "framer-motion";

export default function CurvedText() {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {/* Full width horizontal text flow */}
      <svg viewBox="0 0 1800 140" className="w-full h-full absolute inset-0">
        {/* Define paths for before and after the waveform */}
        <path
          id="beforeWaveform"
          d="M -400 70 L 900 70"
          fill="transparent"
          stroke="transparent"
        />
        <path
          id="afterWaveform" 
          d="M 900 70 L 2200 70"
          fill="transparent"
          stroke="transparent"
        />
        
        {/* Text before waveform - normal styling */}
        <motion.text
          fill="#777777"
          fontSize="22"
          fontFamily="Inter, sans-serif"
          fontWeight="300"
          fontStyle="italic"
        >
          <motion.textPath
            href="#beforeWaveform"
            startOffset="-100%"
            animate={{ startOffset: ["-100%", "100%"] }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 0
            }}
          >
            &quot;Upload your video, let AI learn your style, watch your content perform better than ever&quot; • &quot;Upload your video, let AI learn your style, watch your content perform better than ever&quot; • &quot;Upload your video, let AI learn your style, watch your content perform better than ever&quot; • 
          </motion.textPath>
        </motion.text>

        {/* Text after waveform - highlighted styling */}
        <motion.text
          fill="white"
          fontSize="22"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
          fontStyle="italic"
          letterSpacing="0.8px"
        >
          <motion.textPath
            href="#afterWaveform"
            startOffset="-100%"
            animate={{ startOffset: ["-100%", "100%"] }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 0
            }}
          >
            <tspan 
              fill="white" 
              stroke="#000000" 
              strokeWidth="4"
              paintOrder="stroke fill"
            >
              &quot;Upload your video, let AI learn your style, watch your content perform better than ever&quot; • &quot;Upload your video, let AI learn your style, watch your content perform better than ever&quot; • &quot;Upload your video, let AI learn your style, watch your content perform better than ever&quot; • 
            </tspan>
          </motion.textPath>
        </motion.text>
      </svg>
      
      {/* Audio Waveform Icon - positioned in center of the horizontal path */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-end space-x-1 bg-[#000000] rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-end space-x-0.5">
            {[...Array(16)].map((_, i) => (
              <motion.div 
                key={i} 
                className="w-0.5 bg-white rounded-full" 
                style={{height: `${8 + (i % 5) * 4}px`}}
                animate={{
                  height: [`${8 + (i % 5) * 4}px`, `${16 + (i % 4) * 6}px`, `${8 + (i % 5) * 4}px`]
                }}
                transition={{
                  duration: 0.8 + (i * 0.05),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
