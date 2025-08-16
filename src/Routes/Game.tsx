import { motion } from "framer-motion";

import { useEffect } from "react";
import { launchGame } from "../Components/ui/Game";
import { Animate, FadeUp } from "../Animation/Animate";
export default function Game() {
  useEffect(() => {
    // Start the game
    const gameInstance = launchGame();

    // Cleanup when leaving the page
    return () => {
      if (gameInstance && gameInstance.destroy) {
        gameInstance.destroy(true);  
      }
    };
  }, []);
  return (
    <motion.section {...FadeUp} {...Animate}>
      <div className="  flex justify-center items-center">
        <div id="game-container"></div>
      </div>
    </motion.section>
  );
}
