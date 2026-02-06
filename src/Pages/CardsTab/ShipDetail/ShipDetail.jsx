import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../../hooks/useGame";

import FusionInterface from "./FusionInterface";
import HangarDisplay from "./HangarDisplay";
import UpgradeModal from "./UpgradeModal";

const ShipDetail = ({ ship: initialShip, onClose }) => {
  // 1. Get gold and upgradeShip from your hook
  const { resources, gold, upgradeShip, playerShips } = useGame();
  const ship = playerShips.find((s) => s.id === initialShip.id) || initialShip;
  // 2. Define the missing state for the Upgrade Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // 3. Define the missing handleConfirmUpgrade function
  const handleConfirmUpgrade = (useGems) => {
    upgradeShip(ship.id, useGems);
    setShowUpgradeModal(false);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="fixed inset-0 z-[150] bg-[#020617] flex flex-col font-orbitron text-white overflow-hidden pt-[72px]"
    >
      {/* PART 1: THE VISUAL HANGAR */}
      <HangarDisplay
        ship={ship}
        onClose={onClose}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
      />

      {/* PART 2: THE INTERACTIVE UPGRADE HUB */}
      <FusionInterface
        ship={ship}
        resources={resources}
        goldBalance={gold}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />

      {/* PART 3: THE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal
            ship={ship}
            goldBalance={gold}
            currentResources={resources}
            onClose={() => setShowUpgradeModal(false)}
            onConfirm={handleConfirmUpgrade}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ShipDetail;
