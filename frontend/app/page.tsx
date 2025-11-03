"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4">
        <h1 className="text-2xl font-bold text-purple-600">Aura</h1>
        <nav className="space-x-6 text-gray-700 hidden md:block">
          <a href="#features" className="hover:text-purple-600 transition">Features</a>
          <a href="#about" className="hover:text-purple-600 transition">About</a>
        </nav>
        <Link href="/auth">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Login
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold text-gray-900 leading-tight max-w-3xl"
        >
          Your AI-Powered <span className="text-purple-600">Chat Workspace</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 text-lg text-gray-600 max-w-xl"
        >
          Aura helps you chat, learn, and collaborate with AI — all in one clean interface.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-8"
        >
          <Link href="/auth">
            <Button className="px-8 py-6 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
