import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Loading = () => {
  const { nextUrl } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (nextUrl) {
      const timer = setTimeout(() => {
        navigate('/' + nextUrl);
      }, 8000);
      // ✅ Cleanup timeout on unmount
      return () => clearTimeout(timer);
    }
  }, [nextUrl, navigate]); // ✅ Added dependencies

  return (
    <div className="flex justify-center items-center h-[80vh]">
      {/* ✅ Added border color for visibility */}
      <div className="animate-spin rounded-full h-14 w-14 border-2 border-gray-300 border-t-primary"></div>
    </div>
  );
};

export default Loading;
