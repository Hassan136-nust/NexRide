'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Gauge, Clock } from 'lucide-react'

type PricingModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PricingModal({ isOpen, onClose, onSuccess }: PricingModalProps) {
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [baseFare, setBaseFare] = useState('')
  const [perKmFare, setPerKmFare] = useState('')
  const [waitingFare, setWaitingFare] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      fetch('/api/partner/onboarding/vehicle')
        .then(res => res.json())
        .then(data => {
          if (data.vehicle) {
            setVehicle(data.vehicle)
            setBaseFare(data.vehicle.baseFare ? String(data.vehicle.baseFare) : '')
            setPerKmFare(data.vehicle.perKmFare ? String(data.vehicle.perKmFare) : '')
            setWaitingFare(data.vehicle.waitingFare ? String(data.vehicle.waitingFare) : '')
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!baseFare || !perKmFare || !waitingFare) {
      setError('All fields are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/partner/onboarding/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseFare, perKmFare, waitingFare })
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save pricing')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm'
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl'
          >
            <div className='flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0a0a]'>
              <h2 className='text-base font-semibold text-white flex items-center gap-2'>
                <DollarSign size={16} className='text-emerald-400' /> Configure Pricing Plans
              </h2>
              <button onClick={onClose} className='text-gray-500 hover:text-white transition'>
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className='p-8 flex justify-center'>
                <div className='w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin' />
              </div>
            ) : vehicle ? (
              <form onSubmit={handleSubmit} className='p-5 space-y-5'>

                {/* Vehicle Preview */}
                <div className='flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl'>
                  {vehicle.imageUrl && (
                    <div className='w-16 h-16 rounded-lg overflow-hidden shrink-0'>
                      <img src={vehicle.imageUrl} alt='Vehicle' className='w-full h-full object-cover' />
                    </div>
                  )}
                  <div>
                    <p className='text-sm font-bold text-white'>{vehicle.vehicleModel}</p>
                    <p className='text-xs text-gray-400 mt-0.5 capitalize'>{vehicle.type} • {vehicle.number}</p>
                  </div>
                </div>

                {error && <p className='text-xs text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20 text-center'>{error}</p>}

                <div className='space-y-4'>
                  <div>
                    <label className='text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5'><DollarSign size={12} /> Base Price (Rs.)</label>
                    <input
                      type="number" min="0" required
                      value={baseFare} onChange={e => setBaseFare(e.target.value)}
                      className='w-full bg-black border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition'
                    />
                  </div>
                  <div>
                    <label className='text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5'><Gauge size={12} /> Per KM Fare (Rs.)</label>
                    <input
                      type="number" min="0" required
                      value={perKmFare} onChange={e => setPerKmFare(e.target.value)}
                      className='w-full bg-black border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition'
                    />
                  </div>
                  <div>
                    <label className='text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5'><Clock size={12} /> Waiting Fare (Rs. / min)</label>
                    <input
                      type="number" min="0" required
                      value={waitingFare} onChange={e => setWaitingFare(e.target.value)}
                      className='w-full bg-black border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition'
                    />
                  </div>
                </div>

                <div className='pt-2'>
                  <button disabled={submitting} className='w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50'>
                    {submitting ? 'Saving...' : 'Submit Pricing for Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div className='p-8 text-center text-sm text-gray-500'>
                Vehicle data missing. Please complete Step 1 first.
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  )
}