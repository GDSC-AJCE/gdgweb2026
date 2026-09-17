"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import GoogleLabsLoadingIcon, { GoogleLabsLoaderVariant, GoogleLabsLoaderSize } from "./ui/GoogleLabsLoadingIcon";

export interface LoadingSpinnerProps {
  text?: string;
  variant?: GoogleLabsLoaderVariant;
  size?: GoogleLabsLoaderSize | number;
  className?: string;
}

export default function LoadingSpinner({
  text = "Loading...",
  variant = "cluster",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-4 select-none ${className}`}>
      <GoogleLabsLoadingIcon variant={variant} size={size} />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium tracking-tight text-[#2c2e2a]/75 text-center max-w-xs"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export { GoogleLabsLoadingIcon };

export function useFullPageLoader() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Processing...");

  const show = (msg: string = "Processing...") => {
    setMessage(msg);
    setLoading(true);
  };

  const hide = () => {
    setLoading(false);
  };

  const FullPageLoaderComponent = loading ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f5f1e4]/85 backdrop-blur-md p-4"
    >
      <div className="bg-white border border-[#d5d5d4] p-8 rounded-[36px] shadow-lg flex flex-col items-center max-w-sm w-full">
        <LoadingSpinner text={message} size="lg" variant="cluster" />
      </div>
    </motion.div>
  ) : null;

  return { show, hide, FullPageLoaderComponent, isLoading: loading };
}
