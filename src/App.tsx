import { motion } from "framer-motion";
import { Animate, FadeUp } from "./Animation/Animate";
import { BackgroundBeamsWithCollision } from "./Components/ui/background-beams-with-collision";
import Button from "./Components/Button";
function App() {
  return (
    <section>
      <BackgroundBeamsWithCollision>
        <motion.div
          {...FadeUp}
          {...Animate}
          className=" relative z-20 font-bold text-center text-black dark:text-white font-sans tracking-tight px-5 lg:px-10 "
        >
          <div className=" text-7xl  lg:text-9xl relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
              <span className="">Street Traffic</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
              <span className="">Street Traffic</span>
            </div>
          </div>
          <p className="text-center max-w-xl mx-auto my-2 mb-5">
            Street Traffic is a fast-paced 2D traffic control game where players
            manage cars, traffic lights, and road conditions to avoid accidents
            and keep the traffic flowing.
          </p>
          <div>
            <Button>Play ?</Button>
          </div>
        </motion.div>
      </BackgroundBeamsWithCollision>
    </section>
  );
}

export default App;
