'use client'
import React from 'react'
import { useState } from 'react'
import HeroSection from './HeroSection'
import VehicleSection from './VehicleSection'
import AuthModal from './AuthModal'

function PublicHome() {

const [authOpen , setAuthOpen] = useState(false)

  return (
    <>
    <HeroSection/>
    <VehicleSection/>
    <AuthModal open = {authOpen} onClose={()=>setAuthOpen(false)}/>
    </>
  )
}

export default PublicHome