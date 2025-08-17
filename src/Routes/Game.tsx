import { motion } from "framer-motion";

import { useEffect } from "react";
import { launchGame } from "../Components/Game";
import { Animate, FadeUp } from "../Animation/Animate";

export default function Game() {
  useEffect(() => {
    const gameInstance = launchGame();

    return () => {
      if (gameInstance && gameInstance.destroy) {
        gameInstance.destroy(true);
      }
    };
  }, []);
  return (
    <section className="flex flex-col justify-center items-center gap-5 min-h-screen ">
      <div className=" flex justify-center items-center">
        <div id="game-container"></div>
      </div>
      <motion.div {...FadeUp} {...Animate} className="space-x-5">
        <p className=" !text-white text-3xl my-10  ">
          If you want to restart the game , reload the page
        </p>
      </motion.div>
    </section>
  );
}
