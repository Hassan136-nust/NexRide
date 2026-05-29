import React from 'react'

function HeroSection() {
  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-full bg-cover bg-center' style={{backgroundImage: "url('/heroImage.jpg')"}}>

        </div>
    </div>
  )
}

export default HeroSection