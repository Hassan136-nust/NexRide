'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

type NavProps = {
  onLoginClick: () => void
  onSignupClick: () => void
}

function Nav({ onLoginClick, onSignupClick }: NavProps) {
  const pathName = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const Nav_Items = ["Home", "Bookings", "About Us", "Contact"]

  const getHref = (item: string) =>
    item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='fixed top-4 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%]
        z-50 rounded-full bg-[#0B0B0B] text-white
        shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3'
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="NexRide logo"
            width={44}
            height={44}
            priority
          />

          {/* Nav links — desktop */}
          <div className='hidden md:flex items-center gap-10'>
            {Nav_Items.map((item, index) => {
              const href = getHref(item)
              const active = href === pathName
              return (
                <Link
                  key={index}
                  href={href}
                  className={`text-sm font-medium transition ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              )
            })}
          </div>

          {/* Auth buttons — desktop */}
          <div className='hidden md:flex items-center gap-3'>
            <button
              onClick={onLoginClick}
              className='px-4 py-1.5 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition'
            >
              Login
            </button>
            <button
              onClick={onSignupClick}
              className='px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-100 transition'
            >
              Sign Up
            </button>
          </div>

          {/* Hamburger — mobile */}
          <button
            className='md:hidden text-white p-1'
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='fixed top-20 left-1/2 -translate-x-1/2 w-[94%] z-40
            rounded-2xl bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)]
            flex flex-col px-6 py-5 gap-4 md:hidden'
          >
            {Nav_Items.map((item, index) => {
              const href = getHref(item)
              const active = href === pathName
              return (
                <Link
                  key={index}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium transition ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              )
            })}
            <div className='flex gap-3 pt-2 border-t border-white/10'>
              <button
                onClick={() => { setMobileOpen(false); onLoginClick(); }}
                className='flex-1 py-2 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition'
              >
                Login
              </button>
              <button
                onClick={() => { setMobileOpen(false); onSignupClick(); }}
                className='flex-1 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-100 transition'
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Nav