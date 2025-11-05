import React, { useState } from "react";
import { dummyTrailers } from "../assets/assets";
import BlurCircle from "./BlurCircle";
import ReactPlayer from "react-player";
import { PlayCircleIcon } from "lucide-react";

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <p className="text-gray-300 font-medium text-lg text-center">
        Trailers
      </p>

      <div className="relative mt-6">
        {/* ✅ Blur background circle */}
        <BlurCircle top="-100px" right="-100px" />

        {/* ✅ Centered, responsive player */}
        <div className="flex justify-center">
          <ReactPlayer
            url={currentTrailer.videoUrl}
            controls
            className="react-player"
            width="960px"
            height="540px"
          />
        </div>

        {/* ✅ Trailer thumbnails grid */}
        <div className="group grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
          {dummyTrailers.map((trailer) => (
            <div
              key={trailer.image}
              onClick={() => setCurrentTrailer(trailer)}
              className="relative cursor-pointer transition duration-300 hover:-translate-y-1 hover:opacity-100"
            >
              <img
                src={trailer.image}
                alt="trailer thumbnail"
                className={`rounded-lg w-full h-full object-cover brightness-75 ${
                  currentTrailer.image === trailer.image ? "ring-2 ring-primary" : ""
                }`}
              />
              <PlayCircleIcon
                strokeWidth={1.6}
                className="absolute top-1/2 left-1/2 w-10 h-10 md:w-12 md:h-12 text-white transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrailerSection;
