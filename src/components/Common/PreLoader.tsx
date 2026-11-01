import React from "react";
import Diya from "@/components/Diwali/Diya";

const PreLoader = () => {
  return (
    <div className="fixed left-0 top-0 z-999999 flex h-screen w-screen flex-col items-center justify-center gap-4 bg-ivory" role="status" aria-label="Loading">
      <Diya size={64} />
      <span className="font-display italic text-dark-4">Lighting the lamps…</span>
    </div>
  );
};

export default PreLoader;
