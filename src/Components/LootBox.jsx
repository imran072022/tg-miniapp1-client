import React, { useState } from "react";

const LootBox = ({ onRewardClaimed }) => {
  const [status, setStatus] = useState("IDLE"); // IDLE, OPENING, REVEALED

  // Example data - later this comes from your Node.js API
  const mockReveal = () => {
    setStatus("OPENING");

    setTimeout(() => {
      const card = {
        name: "Tesla Tower",
        rarity: "Epic",
        color: "text-purple-500",
      };
      setStatus("REVEALED");
      onRewardClaimed(card);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Box Image / Emoji */}
        <div
          className={`text-9xl mb-8 transition-transform ${status === "OPENING" ? "animate-bounce" : ""}`}
        >
          {status === "REVEALED" ? "🎁" : "📦"}
        </div>

        {status === "IDLE" && (
          <button
            onClick={mockReveal}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 px-10 rounded-full text-xl shadow-[0_0_20px_rgba(234,179,8,0.5)]"
          >
            OPEN CRATE
          </button>
        )}

        {status === "OPENING" && (
          <p className="text-white text-2xl font-bold animate-pulse">
            Unlocking...
          </p>
        )}

        {status === "REVEALED" && (
          <div className="animate-in zoom-in duration-300">
            <h2 className="text-white text-sm uppercase tracking-widest opacity-70">
              New Card Found!
            </h2>
            <h3 className="text-5xl font-black text-purple-500 drop-shadow-md">
              TESLA TOWER
            </h3>
            <button
              onClick={() => setStatus("IDLE")}
              className="mt-8 text-white/50 underline"
            >
              Collect & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LootBox;
