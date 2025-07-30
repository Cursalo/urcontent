import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import React from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg rounded",
          description: "group-[.toast]:text-gray-600",
          actionButton: "group-[.toast]:bg-black group-[.toast]:text-white rounded",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-900 rounded",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };