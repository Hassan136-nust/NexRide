'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Upload, FileText, BadgeCheck } from 'lucide-react'

export default function Page() {

  const step = 2 // 🔥 IMPORTANT: Step 2 active

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
            Upload Documents
          </h1>

          <p className='text-gray-300 mt-2'>
            Your documents are securely stored and verified by our team
          </p>

          {/* SECURITY BADGE */}
          <div className='mt-4 flex items-center justify-center gap-2 text-sm text-green-400'>
            <ShieldCheck size={18} />
            Secure Verification System
          </div>
        </motion.div>

        {/* 🔥 STEP INDICATOR (SAME AS STEP 1) */}
        <div className='flex justify-center mt-8 gap-4'>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-20 rounded-full transition-all duration-300 ${
                step >= s ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* INFO CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='max-w-3xl mx-auto mt-10 bg-white/10 border border-white/20 rounded-2xl p-5'
        >
          <div className='flex items-center gap-3 text-gray-300'>
            <BadgeCheck className='text-green-400' />
            <p className='text-sm'>
              We verify all documents manually to ensure safety and trust in our platform.
            </p>
          </div>
        </motion.div>

        {/* UPLOAD GRID */}
        <div className='max-w-5xl mx-auto mt-10 grid md:grid-cols-3 gap-6'>

          <UploadCard title="CNIC Front & Back" />
          <UploadCard title="Driving License" />
          <UploadCard title="Vehicle Registration (RC)" />

        </div>

        {/* BUTTONS */}
        <div className='flex justify-between max-w-5xl mx-auto mt-10'>

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
            Next Step
          </motion.button>

        </div>

      </div>
    </div>
  )
}

/* UPLOAD CARD */
function UploadCard({ title }: { title: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className='bg-white/10 border border-white/20 rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center gap-3 text-center'
    >
      <FileText size={30} className='text-gray-300' />

      <h3 className='text-sm font-medium text-gray-200'>{title}</h3>

      <div className='flex items-center gap-2 text-xs text-gray-400'>
        <Upload size={14} />
        Click to upload
      </div>
    </motion.div>
  )
}