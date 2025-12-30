import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nancy 教你学汉语 | Nancy Teaches Mandarin",
  description: "用真正有效的方法学习中文 - Learn Mandarin with methods that actually work",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
