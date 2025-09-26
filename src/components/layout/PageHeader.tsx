"use client";

import { useAtom } from "jotai";
import { themeAtom } from "@/atoms/uiAtoms";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sun, Moon, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase/config";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showLogout?: boolean;
  showThemeToggle?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({
  title = "DijiBill",
  subtitle,
  showLogout = true,
  showThemeToggle = true,
  children,
}: PageHeaderProps) {
  const [theme, setTheme] = useAtom(themeAtom);
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <>
      {/* Top Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 flex justify-end p-2 pr-4 border ${
          isDark
            ? "bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-slate-700/30"
            : "bg-gradient-to-r from-white/60 to-blue-50/60 border-blue-200/30"
        } backdrop-blur-sm`}
      >
        <div className="flex gap-3">
          {showThemeToggle && (
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
          {showLogout && (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div
        className={`flex items-stretch mb-12 p-8 rounded-2xl border ${
          isDark
            ? "bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50"
            : "bg-gradient-to-r from-white/80 to-blue-50/80 border-blue-200/50"
        } backdrop-blur-sm`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`p-2 rounded-2xl ${
              isDark
                ? "bg-gradient-to-r from-purple-600/10 to-blue-600/10"
                : "bg-gradient-to-r from-blue-600/10 to-indigo-600/10"
            }`}
          >
            <Image
              src="/icon_logo.svg"
              alt="DijiBill Logo"
              width={64}
              height={64}
              className="h-20 w-20"
            />
          </div>
          <h1
            className={`text-3xl font-bold ml-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h1>
        </div>
        {subtitle && (
          <div className="flex-2 flex items-center">
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {subtitle}
            </p>
          </div>
        )}
        {children && <div className="flex-2 flex items-center">{children}</div>}
      </div>

      {/* Content Section Separator */}
      <div
        className={`w-full h-px mb-8 ${
          isDark
            ? "bg-gradient-to-r from-transparent via-slate-600 to-transparent"
            : "bg-gradient-to-r from-transparent via-blue-200 to-transparent"
        }`}
      ></div>
    </>
  );
}
