'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bike,
  Car,
  Truck,
  Bus,
  Gauge,
  Hash,
  ImagePlus,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type VehicleType = "bike" | "car" | "loading" | "truck" | "auto"

export default function Page() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("")

  const vehicles = [
    { type: "bike", icon: Bike },
    { type: "car", icon: Car },
    { type: "truck", icon: Truck },
    { type: "loading", icon: Bus },
    { type: "auto", icon: Gauge },
  ] as const

  return (
    <div className='relative min-h-screen w-full text-white overflow-hidden'>

      {/* BACKGROUND IMAGE (BLUR) */}
      <div
        className='absolute inset-0 bg-cover bg-center scale-105 blur-sm'
        style={{ backgroundImage: "url('/heroImage.jpg')" }}
      />

      {/* DARK OVERLAY */}
      <div className='absolute inset-0 bg-black/70' />

      {/* CONTENT */}
      <div className='relative z-10 px-6 py-10 h-screen overflow-y-auto no-scrollbar'>

        {/* HEADER */}
        <div className='max-w-4xl mx-auto flex items-center justify-between mb-6'>

          {/* BACK BUTTON → EXIT PAGE */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className='flex items-center gap-2 text-sm text-gray-300 hover:text-white transition'
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>

          <div className='text-center flex-1'>
            <h1 className='text-3xl md:text-4xl font-bold'>
              Partner Onboarding
            </h1>
            <p className='text-gray-300 mt-1'>
              Complete your vehicle details to start earning with NexRide
            </p>
          </div>

          <div className='w-[70px]' />
        </div>

        {/* STEP INDICATOR */}
        <div className='flex justify-center mt-6 gap-4'>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-20 rounded-full transition-all ${
                step >= s ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='max-w-5xl mx-auto mt-12'
          >

            <h2 className='text-xl font-semibold mb-6 text-center'>
              Select Vehicle Type
            </h2>

            <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
              {vehicles.map((v) => {
                const Icon = v.icon
                const active = vehicleType === v.type

                return (
                  <motion.div
                    key={v.type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setVehicleType(v.type)}
                    className={`cursor-pointer rounded-2xl p-5 border flex flex-col items-center gap-3 transition-all
                    ${
                      active
                        ? "bg-white text-black border-white"
                        : "bg-white/10 border-white/20 hover:bg-white/20"
                    }`}
                  >
                    <Icon size={28} />
                    <span className='text-sm font-medium capitalize'>
                      {v.type}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* INPUTS */}
            <div className='mt-10 grid md:grid-cols-2 gap-5'>
              <Input icon={<Car size={18} />} label="Vehicle Model" placeholder="Toyota Corolla" />
              <Input icon={<Hash size={18} />} label="Vehicle Number" placeholder="ABC-123" />
              <Input icon={<Gauge size={18} />} label="Base Fare" placeholder="Base fare" type="number" />

              <motion.div whileHover={{ scale: 1.02 }}>
                <label className='text-sm text-gray-300'>Vehicle Image</label>
                <div className='flex items-center gap-2 bg-white/10 p-3 rounded-xl mt-1 cursor-pointer border border-white/20'>
                  <ImagePlus size={18} className='text-gray-300' />
                  <span className='text-gray-300 text-sm'>
                    Upload vehicle image
                  </span>
                </div>
              </motion.div>
            </div>

            {/* NEXT */}
            <div className='flex justify-end mt-10'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!vehicleType}
                onClick={() => setStep(2)}
                className='px-8 py-3 rounded-xl bg-white text-black font-semibold
                disabled:opacity-40 disabled:cursor-not-allowed'
              >
                Next Step
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className='text-center mt-20 text-gray-300'>
            Step 2 Coming Soon (Documents Upload)
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className='text-center mt-20 text-gray-300'>
            Step 3 Coming Soon (Bank Details)
          </div>
        )}

      </div>
    </div>
  )
}

/* INPUT */
function Input({
  icon,
  label,
  placeholder,
  type = "text"
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  type?: string
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <label className='text-sm text-gray-300'>{label}</label>
      <div className='flex items-center gap-2 bg-white/10 p-3 rounded-xl mt-1 border border-white/20'>
        {icon}
        <input
          type={type}
          className='bg-transparent outline-none w-full text-white'
          placeholder={placeholder}
        />
      </div>
    </motion.div>
  )
}