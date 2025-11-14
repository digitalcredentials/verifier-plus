'use client'
import { BottomBar } from "@/components/BottomBar/BottomBar"
import { TopBar } from "@/components/TopBar/TopBar"
import styles from './[publicCredentialId].module.css'
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [isDark, setIsDark] = useState(false);

  return (
    <main className={styles.container}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark} />
      {children}
      <BottomBar isDark={isDark} />
    </main>

  )
}