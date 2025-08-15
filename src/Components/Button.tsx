import React from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import { FadeUp, ViewPort } from "../Animation/Animate";

const Button = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.button
      {...FadeUp}
      {...ViewPort}
      className={cn(
        "py-2 px-3 rounded-xl rounded-b-4xl text-2xl cursor-pointer bg-purple-600 border border-purple-600 hover:bg-transparent select-none duration-150",
        className
      )}
    >
      {children}
    </motion.button>
  );
};

export default Button;
