import { motion } from "framer-motion";

import { useEffect } from "react";
import { launchGame } from "../Game/Game";
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
        <motion.button
          {...Animation}
          onClick={() => window.location.reload()}
          className=" p-5 rounded-2xl bg-purple-600 border border-purple-600 hover:bg-transparent text-white hover:text-purple-600 duration-150"
        >
          Restart ?
        </motion.button>
        <a
          {...Animation}
          href="/"
          onClick={() => window.location.reload()}
          className=" p-5 rounded-2xl bg-purple-600 border border-purple-600 hover:bg-transparent text-white hover:text-purple-600 duration-150"
        >
          Go back to home
        </a>
      </motion.div>
    </section>
  );
}
