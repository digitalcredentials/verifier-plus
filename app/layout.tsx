"use client"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'material-icons/iconfont/material-icons.css';
import { useEffect, useState } from "react";
import { HelpContext } from '@/lib/HelpContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: "VerifierPlus",
  description: "Academic Credential Verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [isHelpEnabled, setIsHelpEnabled] = useState(true);

  const toggleHelp = () => {
    if (isHelpEnabled) {
      setIsHelpEnabled(false);
      localStorage.setItem('helpMode', 'false');
    } else {
      setIsHelpEnabled(true);
      localStorage.setItem('helpMode', 'true');
    }   
  }
   // get local storage value for help mode on mount
  useEffect(() => {
    let helpMode = localStorage.getItem('helpMode');
    if (helpMode === 'true') { 
      setIsHelpEnabled(true); 
    } else { 
      setIsHelpEnabled(false); 
    }
  },[]);
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="root">
          <HelpContext.Provider value={{isHelpEnabled, toggleHelp}}>
            {children}
          </HelpContext.Provider>
        </div>
      </body>
    </html>
  );
}
