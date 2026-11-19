"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#2c2e2a] group-[.toaster]:border-[#e5e1d5] group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl font-sans",
          description: "group-[.toast]:text-[#80827f]",
          actionButton:
            "group-[.toast]:bg-[#2c2e2a] group-[.toast]:text-white group-[.toast]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-[#f5f1e4] group-[.toast]:text-[#80827f] group-[.toast]:rounded-full",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
