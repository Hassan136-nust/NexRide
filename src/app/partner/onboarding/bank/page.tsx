'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Landmark, User, Hash, CreditCard, ShieldCheck } from 'lucide-react'

export default function Page() {

  const step = 3

  return (
    <div className='relative min-h-screen w-full text-white overflow-hidden'>

      {/* BACKGROUND */}
      <div
        className='absolute inset-0 bg-cover bg-center scale-105 blur-sm'
        style={{ backgroundImage: "url('/heroImage.jpg')" }}
      />

      {/* OVERLAY */}
      <div className='absolute inset-0 bg-black/70' />

      {/* CONTENT */}
      <div className='relative z-10 px-6 py-10 min-h-screen'>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='max-w-4xl mx-auto text-center'
        >
          <h1 className='text-3xl md:text-4xl font-bold'>
            Bank Details
          </h1>

          <p className='text-gray-300 mt-2'>
            Add your bank account to receive earnings securely
          </p>

          {/* SECURITY BADGE */}
          <div className='mt-4 flex items-center justify-center gap-2 text-sm text-green-400'>
            <ShieldCheck size={18} />
            Secure Payout System
          </div>
        </motion.div>

        {/* STEP INDICATOR */}
        <div className='flex justify-center mt-8 gap-4'>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-20 rounded-full transition-all ${
                step >= s ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* BANK FORM */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-6'
        >

          <Input icon={<User size={18} />} label="Account Holder Name" placeholder="Hassan " />

          <Input icon={<Landmark size={18} />} label="Bank Name" placeholder="HBL / Meezan / UBL" />

          <Input icon={<Hash size={18} />} label="IFSC / Branch Code" placeholder="12345" />

          <Input icon={<CreditCard size={18} />} label="Account Number" placeholder="1234567890" />

        </motion.div>

        {/* INFO CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          className='max-w-3xl mx-auto mt-10 bg-white/10 border border-white/20 rounded-2xl p-5'
        >
          <p className='text-sm text-gray-300 flex items-center gap-2'>
            <ShieldCheck className='text-green-400' size={18} />
            Your bank details are encrypted and only used for payout processing.
          </p>
        </motion.div>

        {/* BUTTONS */}
        <div className='flex justify-between max-w-4xl mx-auto mt-10'>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20'
          >
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='px-8 py-3 rounded-xl bg-white text-black font-semibold'
          >
            Submit
          </motion.button>

        </div>

      </div>
    </div>
  )
}

/* INPUT COMPONENT */
function Input({
  icon,
  label,
  placeholder
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <label className='text-sm text-gray-300'>{label}</label>

      <div className='flex items-center gap-2 bg-white/10 p-3 rounded-xl mt-1 border border-white/20'>
        {icon}
        <input
          className='bg-transparent outline-none w-full text-white'
          placeholder={placeholder}
        />
      </div>
    </motion.div>
  )
}