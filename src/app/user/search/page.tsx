'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bike,
  Car,
  Clock,
  MapPin,
  Navigation,
  Package,
  Phone,
  Route,
  Scooter,
  Truck,
} from 'lucide-react'
import { forwardGeocode, reverseGeocode } from '@/lib/photon'
import { fetchDrivingRoute } from '@/lib/routing'
import type { RidePoint, RouteStats } from '@/components/SearchMap'

const SearchMap = dynamic(() => import('@/components/SearchMap'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-zinc-200'>
      <span className='text-sm font-medium text-zinc-600'>Loading map…</span>
    </div>
  ),
})

const VEHICLE_META: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  bike: { label: 'Ride Bike', icon: Bike },
  car: { label: 'Ride Car', icon: Car },
  auto: { label: 'Ride Auto', icon: Scooter },
  loading: { label: 'Ride Loader', icon: Package },
  truck: { label: 'NexRide Cargo', icon: Truck },
}

function parseCoord(value: string | null): number | null {
  if (!value) return null
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : null
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const vehicle = searchParams.get('vehicle') || 'car'
  const phone = searchParams.get('phone') || ''
  const pickupLabelParam = searchParams.get('pickup') || ''
  const dropoffLabelParam = searchParams.get('dropoff') || ''

  const [initError, setInitError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [routeLoading, setRouteLoading] = useState(false)

  const [pickup, setPickup] = useState<RidePoint | null>(null)
  const [dropoff, setDropoff] = useState<RidePoint | null>(null)
  const [route, setRoute] = useState<RouteStats | null>(null)

  const loadRoute = useCallback(
    async (pick: RidePoint, drop: RidePoint) => {
      setRouteLoading(true)
      try {
        const result = await fetchDrivingRoute(pick, drop)
        setRoute(result)
      } finally {
        setRouteLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    let cancelled = false

    async function init() {
      setInitializing(true)
      setInitError(null)

      try {
        let pickLat = parseCoord(searchParams.get('pickupLat'))
        let pickLng = parseCoord(searchParams.get('pickupLng'))
        let dropLat = parseCoord(searchParams.get('dropoffLat'))
        let dropLng = parseCoord(searchParams.get('dropoffLng'))

        let pickLabel = pickupLabelParam
        let dropLabel = dropoffLabelParam

        if (pickLat == null || pickLng == null) {
          if (!pickupLabelParam) throw new Error('Missing pickup location')
          const geocoded = await forwardGeocode(pickupLabelParam)
          if (!geocoded) throw new Error('Could not locate pickup address')
          pickLat = geocoded.lat
          pickLng = geocoded.lng
          pickLabel = geocoded.label
        }

        if (dropLat == null || dropLng == null) {
          if (!dropoffLabelParam) throw new Error('Missing dropoff location')
          const geocoded = await forwardGeocode(dropoffLabelParam)
          if (!geocoded) throw new Error('Could not locate dropoff address')
          dropLat = geocoded.lat
          dropLng = geocoded.lng
          dropLabel = geocoded.label
        }

        const pick: RidePoint = {
          lat: pickLat,
          lng: pickLng,
          label: pickLabel || `${pickLat.toFixed(5)}, ${pickLng.toFixed(5)}`,
        }
        const drop: RidePoint = {
          lat: dropLat,
          lng: dropLng,
          label: dropLabel || `${dropLat.toFixed(5)}, ${dropLng.toFixed(5)}`,
        }

        if (cancelled) return
        setPickup(pick)
        setDropoff(drop)
        await loadRoute(pick, drop)
      } catch (e) {
        if (!cancelled) {
          setInitError(
            e instanceof Error ? e.message : 'Failed to load ride details'
          )
        }
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
    // Initial load only — drag updates sync URL without re-init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncUrl = useCallback(
    (pick: RidePoint, drop: RidePoint) => {
      const q = new URLSearchParams({
        vehicle,
        phone,
        pickup: pick.label,
        dropoff: drop.label,
        pickupLat: String(pick.lat),
        pickupLng: String(pick.lng),
        dropoffLat: String(drop.lat),
        dropoffLng: String(drop.lng),
      })
      router.replace(`/user/search?${q.toString()}`, { scroll: false })
    },
    [router, vehicle, phone]
  )

  const handlePickupMoved = useCallback(
    async (point: RidePoint) => {
      if (!dropoff) return
      setPickup(point)
      setRouteLoading(true)
      try {
        const label = await reverseGeocode(point.lat, point.lng)
        const updated = { ...point, label }
        setPickup(updated)
        syncUrl(updated, dropoff)
        await loadRoute(updated, dropoff)
      } catch {
        await loadRoute(point, dropoff)
      }
    },
    [dropoff, loadRoute, syncUrl]
  )

  const handleDropoffMoved = useCallback(
    async (point: RidePoint) => {
      if (!pickup) return
      setDropoff(point)
      setRouteLoading(true)
      try {
        const label = await reverseGeocode(point.lat, point.lng)
        const updated = { ...point, label }
        setDropoff(updated)
        syncUrl(pickup, updated)
        await loadRoute(pickup, updated)
      } catch {
        await loadRoute(pickup, point)
      }
    },
    [pickup, loadRoute, syncUrl]
  )

  const VehicleIcon = VEHICLE_META[vehicle]?.icon ?? Car
  const vehicleLabel = VEHICLE_META[vehicle]?.label ?? vehicle

  if (initializing) {
    return (
      <PageShell>
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
          <span className='h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white' />
          <p className='text-sm text-zinc-400'>Preparing your route…</p>
        </div>
      </PageShell>
    )
  }

  if (initError || !pickup || !dropoff) {
    return (
      <PageShell>
        <div className='flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center'>
          <p className='text-sm text-red-400'>
            {initError || 'Invalid ride parameters'}
          </p>
          <button
            type='button'
            onClick={() => router.push('/user/book')}
            className='rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15'
          >
            Back to booking
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className='flex shrink-0 flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => router.push('/user/book')}
            className='flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white'
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black'>
                <Navigation size={15} strokeWidth={2.5} />
              </div>
              <h1 className='text-base font-black tracking-tight sm:text-lg'>
                Route preview
              </h1>
            </div>
            <p className='mt-0.5 text-[11px] text-zinc-500'>
              Confirm pickup, dropoff, and estimated trip
            </p>
          </div>
        </div>
      </header>

      <div className='no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5'>
        <section className='h-[min(52vh,420px)] shrink-0'>
          <SearchMap
            pickup={pickup}
            dropoff={dropoff}
            route={route}
            routeLoading={routeLoading}
            onPickupMoved={handlePickupMoved}
            onDropoffMoved={handleDropoffMoved}
          />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='shrink-0 space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5'
        >
          <h2 className='text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500'>
            Ride summary
          </h2>

          <div className='grid gap-3 sm:grid-cols-2'>
            <SummaryRow
              icon={<VehicleIcon size={16} className='text-white' />}
              label='Service'
              value={vehicleLabel}
            />
            <SummaryRow
              icon={<Phone size={16} className='text-emerald-400' />}
              label='Contact'
              value={phone || '—'}
            />
            <SummaryRow
              icon={<Route size={16} className='text-emerald-400' />}
              label='Distance'
              value={
                routeLoading
                  ? 'Updating…'
                  : route
                    ? `${route.distanceKm} km`
                    : '—'
              }
            />
            <SummaryRow
              icon={<Clock size={16} className='text-sky-400' />}
              label='Est. ride time'
              value={
                routeLoading
                  ? 'Updating…'
                  : route
                    ? `${route.durationMin} min`
                    : '—'
              }
            />
          </div>

          <div className='space-y-2 border-t border-white/[0.06] pt-3'>
            <LocationRow
              color='bg-amber-500'
              title='Pickup'
              address={pickup.label}
            />
            <LocationRow
              color='bg-sky-500'
              title='Dropoff'
              address={dropoff.label}
            />
          </div>

          <button
            type='button'
            onClick={() => router.push('/user/book')}
            className='mt-2 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10'
          >
            Edit booking details
          </button>
        </motion.section>
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black font-sans text-white'>
      <div
        className='absolute inset-0 scale-105 bg-cover bg-center blur-[6px]'
        style={{ backgroundImage: "url('/heroImage.jpg')" }}
      />
      <div className='absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/95' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.08),transparent)]' />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative z-10 mx-3 flex h-[calc(100dvh-2rem)] max-h-[920px] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/50 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:mx-5'
      >
        {children}
      </motion.div>
    </div>
  )
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5'>
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10'>
        {icon}
      </div>
      <div className='min-w-0'>
        <p className='text-[9px] font-bold uppercase tracking-wider text-zinc-500'>
          {label}
        </p>
        <p className='truncate text-sm font-semibold text-white'>{value}</p>
      </div>
    </div>
  )
}

function LocationRow({
  color,
  title,
  address,
}: {
  color: string
  title: string
  address: string
}) {
  return (
    <div className='flex gap-3 rounded-xl border border-white/[0.06] bg-black/25 p-3'>
      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <div className='min-w-0 flex-1'>
        <p className='flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500'>
          <MapPin size={10} />
          {title}
        </p>
        <p className='mt-0.5 text-sm leading-snug text-white'>{address}</p>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className='fixed inset-0 flex items-center justify-center bg-black text-sm text-zinc-400'>
          Loading…
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
