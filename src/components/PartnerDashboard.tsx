'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Car,
  FileText,
  Banknote,
  Eye,
  Video,
  DollarSign,
  CheckCircle2,
  Rocket,
  Clock
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

type StepStatus = "completed" | "active" | "locked"

export default function PartnerDashboard() {
  const router = useRouter()

  const userData = useSelector((state: RootState) => state.user.userData)

  const currentStep = userData?.partnerOnboardingSteps ?? 1
  const isVerified = userData?.isPartnerVerified ?? false

  const steps = [
    { id: 1, title: "Vehicle", icon: Car, route: "/partner/onboarding/vehicle" },
    { id: 2, title: "Documents", icon: FileText, route: "/partner/onboarding/documents" },
    { id: 3, title: "Bank", icon: Banknote, route: "/partner/onboarding/bank" },
    { id: 4, title: "Review", icon: Eye, route: "#" },
    { id: 5, title: "Video KYC", icon: Video, route: "#" },
    { id: 6, title: "Pricing", icon: DollarSign, route: "#" },
    { id: 7, title: "Final Review", icon: CheckCircle2, route: "#" },
    { id: 8, title: "Live", icon: Rocket, route: "#" },
  ]

  const getStatus = (stepId: number): StepStatus => {
    if (stepId <= currentStep) return "completed"
    // next step after all completed ones is active, unless we're at the end
    if (stepId === currentStep + 1 && currentStep < steps.length) return "active"
    return "locked"
  }

  const progress = Math.round((currentStep / steps.length) * 100)

  return (
   <div className="min-h-screen bg-black text-white p-6 pt-24">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Complete onboarding to start earning with NexRide
        </p>

        {/* STATUS BANNER */}
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-center justify-center gap-3 
            bg-white/5 border border-white/10 text-gray-300
            rounded-2xl px-5 py-3 max-w-lg mx-auto"
          >
            <Clock size={18} className="text-gray-400" />
            <p className="text-sm">
              Your account is pending verification. You can continue onboarding.
            </p>
          </motion.div>
        )}

        {/* PROGRESS BAR */}
        <div className="mt-6">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-white"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progress}% completed</p>
        </div>
      </div>

      {/* STEP CONNECTOR */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">

          {steps.map((step, i) => {
            const status = getStatus(step.id)

            return (
              <div key={step.id} className="flex items-center flex-1">

                {/* NODE */}
                <div
                  className={`w-5 h-5 rounded-full z-10 flex items-center justify-center border
                  ${
                    status === "completed"
                      ? "bg-emerald-500 border-emerald-500"
                      : status === "active"
                      ? "bg-black border-white"
                      : "bg-white/10 border-white/20"
                  }`}
                >
                  {status === "completed" && (
                    <CheckCircle2 size={12} className="text-black" />
                  )}
                </div>

                {/* LINE */}
                {i !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2
                    ${step.id <= currentStep ? "bg-emerald-500" : "bg-white/10"}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* STEP CARDS */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">

        {steps.map((step) => {
          const status = getStatus(step.id)
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              whileHover={status !== "locked" ? { scale: 1.03 } : {}}
              whileTap={status !== "locked" ? { scale: 0.98 } : {}}
              onClick={() => {
                if (status === "locked") return
                if (step.route !== "#") router.push(step.route)
              }}
              className={`relative p-3 rounded-xl border cursor-pointer transition-all
                ${
                  status === "completed"
                    ? "bg-white/10 border-white/20"
                    : status === "active"
                    ? "bg-white/5 border-white"
                    : "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                }
              `}
            >

              {/* ICON */}
              <div className="flex items-center justify-center mb-2">
                <div className={`p-2 rounded-lg
                  ${
                    status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : status === "active"
                      ? "bg-white/10 text-white"
                      : "bg-white/5 text-gray-500"
                  }
                `}>
                  <Icon size={18} />
                </div>
              </div>

              {/* TITLE */}
              <h3 className="text-xs font-medium text-center">
                {step.title}
              </h3>

              {/* STATUS TEXT */}
              <p className="text-[10px] text-center mt-1 text-gray-400">
                {status === "completed"
                  ? "Completed"
                  : status === "active"
                  ? "In Progress"
                  : "Locked"}
              </p>

              {/* BADGE */}
              <div className="absolute top-2 right-2">
                {status === "completed" && (
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle2 size={12} className="text-black" />
                  </div>
                )}

                {status === "active" && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </div>

            </motion.div>
          )
        })}
      </div>
    </div>
  )
}