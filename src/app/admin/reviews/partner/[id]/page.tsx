'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowLeft, Car, FileText, Landmark, User,
  CheckCircle, XCircle, ZoomIn, X, Clock,
  Hash, Gauge, CreditCard, Shield, AlertTriangle
} from 'lucide-react'

type PartnerData = {
  user: {
    _id: string
    name: string
    email: string
    partnerStatus: string
    partnerOnboardingSteps: number
    partnerRejectionReason?: string
  }
  vehicle: {
    type: string
    vehicleModel: string
    number: string
    imageUrl?: string
    baseFare?: number
    status: string
    rejectionReason?: string
  } | null
  docs: {
    CNIC_Url: string
    License_Url: string
    vehicle_rc: string
    status: string
    rejectionReason?: string
  } | null
  bank: {
    accountHolderName: string
    bankName: string
    ifscCode: string
    accountNumber: string
    status: string
    rejectionReason?: string
  } | null
}

type Section = 'vehicle' | 'documents' | 'bank'

export default function PartnerReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [data, setData]             = useState<PartnerData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [lightbox, setLightbox]     = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectSection, setRejectSection] = useState<Section | null>(null)
  const [reason, setReason]         = useState('')

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/admin/reviews/partner/${id}`)
      if (!res.ok) { setError('Failed to load partner data'); return }
      setData(await res.json())
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPartner() }, [id])

  const handleSectionAction = async (section: Section, action: 'approve' | 'reject', rejectReason?: string) => {
    if (action === 'reject' && !rejectReason?.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/reviews/partner/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, action, reason: rejectReason }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message || 'Action failed'); return }
      setRejectOpen(false); setRejectSection(null); setReason('')
      await fetchPartner()
    } catch { setError('Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleFinalApprove = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/reviews/partner/${id}/approve`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) { setError(json.message || 'Final approval failed'); return }
      router.push('/')
    } catch { setError('Something went wrong') }
    finally { setSubmitting(false) }
  }

  /* ── LOADING ── */
  if (loading) return (
    <div className='min-h-screen bg-[#080808] flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin' />
        <p className='text-sm text-gray-500'>Loading partner details...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className='min-h-screen bg-[#080808] flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <AlertTriangle size={40} className='text-red-500 mx-auto' />
        <p className='text-red-400 text-sm'>{error || 'Partner not found'}</p>
        <button onClick={() => router.push('/')} className='px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-sm text-white'>
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  const { user, vehicle, docs, bank } = data
  const allSectionsApproved =
    vehicle?.status === 'approved' &&
    docs?.status    === 'approved' &&
    bank?.status    === 'verified'

  const statusBadge = (s: string) => {
    if (s === 'approved' || s === 'verified')
      return <span className='inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium'><CheckCircle size={9} />Approved</span>
    if (s === 'rejected')
      return <span className='inline-flex items-center gap-1 text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-medium'><XCircle size={9} />Rejected</span>
    return <span className='inline-flex items-center gap-1 text-[10px] bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full font-medium'><Clock size={9} />Pending</span>
  }

  return (
    <div className='min-h-screen bg-[#060606] text-white'>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className='fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-md'
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className='relative max-w-4xl w-full'
            >
              <button onClick={() => setLightbox(null)}
                className='absolute -top-11 right-0 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition'>
                <X size={18} />
              </button>
              <div className='rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center'>
                <img src={lightbox} alt='preview' className='max-w-full max-h-[80vh] object-contain' />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REJECT MODAL ── */}
      <AnimatePresence>
        {rejectOpen && rejectSection && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm'
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 16 }}
              className='bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4'
            >
              <div>
                <h3 className='text-sm font-semibold capitalize'>Reject {rejectSection === 'bank' ? 'Bank Details' : rejectSection}</h3>
                <p className='text-xs text-gray-500 mt-1'>The partner will see this reason.</p>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Why are you rejecting the ${rejectSection} details?`}
                rows={4}
                className='w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-white/30 transition'
              />
              {!reason.trim() && <p className='text-xs text-red-400'>Reason is required.</p>}
              <div className='flex gap-3'>
                <button onClick={() => { setRejectOpen(false); setRejectSection(null); setReason('') }}
                  className='flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition'>
                  Cancel
                </button>
                <button
                  disabled={!reason.trim() || submitting}
                  onClick={() => handleSectionAction(rejectSection, 'reject', reason)}
                  className='flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition'>
                  {submitting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STICKY HEADER ── */}
      <header className='sticky top-0 z-30 bg-[#060606]/90 backdrop-blur border-b border-white/[0.07] px-6 py-3.5 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button onClick={() => router.push('/')}
            className='text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition'>
            <ArrowLeft size={15} />
          </button>
          <div className='flex items-center gap-3'>
            <div className='w-7 h-7 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center justify-center'>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className='text-xs font-semibold'>{user.name}</p>
              <p className='text-[10px] text-gray-600'>{user.email}</p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {statusBadge(user.partnerStatus)}
          <div className='h-4 w-px bg-white/10' />
          <Image src='/logo.png' alt='NexRide' width={24} height={24} />
        </div>
      </header>

      {/* ── PAGE BODY ── */}
      <div className='max-w-7xl mx-auto px-6 py-6'>

        {/* ── TOP ROW: Partner info + Final approve ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className='flex flex-col md:flex-row gap-4 mb-6'
        >
          {/* Partner card */}
          <div className='flex-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4'>
            <div className='w-12 h-12 rounded-2xl bg-white/10 text-white text-xl font-bold flex items-center justify-center shrink-0'>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold'>{user.name}</p>
              <p className='text-xs text-gray-500 truncate'>{user.email}</p>
              <div className='flex items-center gap-3 mt-2'>
                <span className='flex items-center gap-1 text-[10px] text-gray-500'>
                  <Clock size={9} className='text-yellow-400' /> {user.partnerOnboardingSteps}/3 steps
                </span>
                <span className='text-[10px] text-gray-700 font-mono'>#{user._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
            {user.partnerStatus === 'rejected' && user.partnerRejectionReason && (
              <div className='bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 max-w-xs'>
                <p className='text-[10px] text-red-400 font-medium'>Rejected:</p>
                <p className='text-[10px] text-red-300/70 mt-0.5 leading-relaxed'>{user.partnerRejectionReason}</p>
              </div>
            )}
          </div>

          {/* Final approve banner */}
          {allSectionsApproved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className='bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 flex items-center gap-4 md:w-72'
            >
              <div className='w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0'>
                <CheckCircle size={18} className='text-emerald-400' />
              </div>
              <div className='flex-1'>
                <p className='text-xs font-semibold text-emerald-400'>All sections approved</p>
                <p className='text-[10px] text-gray-500 mt-0.5'>Ready for final approval</p>
                <button
                  disabled={submitting}
                  onClick={handleFinalApprove}
                  className='mt-2.5 w-full py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition disabled:opacity-50'
                >
                  {submitting ? 'Approving...' : 'Finalize & Approve'}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className='bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 flex items-center gap-3 md:w-72'>
              <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0'>
                <Shield size={16} className='text-gray-600' />
              </div>
              <div>
                <p className='text-xs font-medium text-gray-400'>Pending Review</p>
                <p className='text-[10px] text-gray-600 mt-0.5'>Review all sections below to approve</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── MAIN GRID: Left col + Right col ── */}
        <div className='grid lg:grid-cols-2 gap-5'>

          {/* ── LEFT COLUMN ── */}
          <div className='space-y-5'>

            {/* VEHICLE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'
            >
              <div className='flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]'>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <Car size={14} className='text-gray-400' /> Vehicle
                </div>
                {vehicle && statusBadge(vehicle.status)}
              </div>

              {vehicle ? (
                <div className='p-5 space-y-4'>
                  {/* Vehicle image */}
                  {vehicle.imageUrl && (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setLightbox(vehicle.imageUrl!)}
                      className='relative rounded-xl overflow-hidden cursor-pointer group h-44 bg-white/5 border border-white/[0.07]'
                    >
                      <img src={vehicle.imageUrl} alt='vehicle' className='w-full h-full object-cover group-hover:scale-105 transition duration-300' />
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center'>
                        <span className='flex items-center gap-1.5 text-xs bg-black/70 border border-white/10 px-3 py-1.5 rounded-full text-gray-300'>
                          <ZoomIn size={12} /> Full View
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {/* Info grid */}
                  <div className='grid grid-cols-2 gap-2.5'>
                    <InfoItem icon={<Car size={11} />}   label='Type'      value={vehicle.type} />
                    <InfoItem icon={<Car size={11} />}   label='Model'     value={vehicle.vehicleModel} />
                    <InfoItem icon={<Hash size={11} />}  label='Plate'     value={vehicle.number} />
                    <InfoItem icon={<Gauge size={11} />} label='Base Fare' value={`Rs. ${vehicle.baseFare ?? 0}`} />
                  </div>
                  {vehicle.status === 'rejected' && vehicle.rejectionReason && <RejectionNote reason={vehicle.rejectionReason} />}
                  {vehicle.status === 'pending' && (
                    <ActionBar
                      onApprove={() => handleSectionAction('vehicle', 'approve')}
                      onReject={() => { setRejectSection('vehicle'); setRejectOpen(true) }}
                      submitting={submitting} label='Vehicle'
                    />
                  )}
                </div>
              ) : <EmptySection label='vehicle' />}
            </motion.div>

            {/* BANK CARD */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'
            >
              <div className='flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]'>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <Landmark size={14} className='text-gray-400' /> Bank Details
                </div>
                {bank && statusBadge(bank.status)}
              </div>

              {bank ? (
                <div className='p-5 space-y-4'>
                  <div className='grid grid-cols-2 gap-2.5'>
                    <InfoItem icon={<User size={11} />}       label='Account Holder' value={bank.accountHolderName} />
                    <InfoItem icon={<Landmark size={11} />}   label='Bank'           value={bank.bankName} />
                    <InfoItem icon={<Hash size={11} />}       label='IFSC / Branch'  value={bank.ifscCode} />
                    <InfoItem icon={<CreditCard size={11} />} label='Account No.'    value={bank.accountNumber} />
                  </div>
                  {bank.status === 'rejected' && bank.rejectionReason && <RejectionNote reason={bank.rejectionReason} />}
                  {bank.status === 'added' && (
                    <ActionBar
                      onApprove={() => handleSectionAction('bank', 'approve')}
                      onReject={() => { setRejectSection('bank'); setRejectOpen(true) }}
                      submitting={submitting} label='Bank Details'
                    />
                  )}
                </div>
              ) : <EmptySection label='bank details' />}
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN: DOCUMENTS ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden h-fit'
          >
            <div className='flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]'>
              <div className='flex items-center gap-2 text-sm font-semibold'>
                <FileText size={14} className='text-gray-400' /> Documents
              </div>
              {docs && statusBadge(docs.status)}
            </div>

            {docs ? (
              <div className='p-5 space-y-4'>
                {/* 3 doc images stacked */}
                {[
                  { label: 'CNIC / Identity', url: docs.CNIC_Url },
                  { label: 'Driving License', url: docs.License_Url },
                  { label: 'Vehicle RC',       url: docs.vehicle_rc },
                ].map((doc, i) => (
                  <motion.div
                    key={doc.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className='space-y-1.5'
                  >
                    <p className='text-[10px] text-gray-500 uppercase tracking-wider'>{doc.label}</p>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setLightbox(doc.url)}
                      className='relative rounded-xl overflow-hidden cursor-pointer group h-36 bg-white/5 border border-white/[0.07]'
                    >
                      <img src={doc.url} alt={doc.label} className='w-full h-full object-cover group-hover:scale-105 transition duration-300' />
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center'>
                        <span className='flex items-center gap-1.5 text-xs bg-black/70 border border-white/10 px-3 py-1.5 rounded-full text-gray-300'>
                          <ZoomIn size={12} /> View Full
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}

                {docs.status === 'rejected' && docs.rejectionReason && <RejectionNote reason={docs.rejectionReason} />}
                {docs.status === 'pending' && (
                  <ActionBar
                    onApprove={() => handleSectionAction('documents', 'approve')}
                    onReject={() => { setRejectSection('documents'); setRejectOpen(true) }}
                    submitting={submitting} label='Documents'
                  />
                )}
              </div>
            ) : <EmptySection label='documents' />}
          </motion.div>

        </div>
      </div>
    </div>
  )
}

/* ── SUB-COMPONENTS ── */

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 hover:border-white/10 transition'>
      <span className='text-gray-600 shrink-0'>{icon}</span>
      <div className='min-w-0'>
        <p className='text-[9px] text-gray-600 uppercase tracking-widest'>{label}</p>
        <p className='text-xs font-medium text-gray-200 truncate mt-0.5'>{value}</p>
      </div>
    </div>
  )
}

function ActionBar({ onApprove, onReject, submitting, label }: {
  onApprove: () => void; onReject: () => void; submitting: boolean; label: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className='flex gap-2.5 pt-3 border-t border-white/[0.07]'
    >
      <button onClick={onReject}
        className='flex-1 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/5 transition flex items-center justify-center gap-1.5'>
        <XCircle size={12} /> Reject
      </button>
      <button disabled={submitting} onClick={onApprove}
        className='flex-1 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition disabled:opacity-50 flex items-center justify-center gap-1.5'>
        <CheckCircle size={12} /> {submitting ? 'Saving...' : 'Approve'}
      </button>
    </motion.div>
  )
}

function RejectionNote({ reason }: { reason: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className='bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-xs text-red-300/80'
    >
      <span className='font-semibold text-red-400'>Rejection reason: </span>{reason}
    </motion.div>
  )
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <Shield size={24} className='text-gray-700 mb-2' />
      <p className='text-xs text-gray-600'>No {label} data submitted.</p>
    </div>
  )
}
