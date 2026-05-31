import React from 'react'
type Props = {
  userId?: string
}

function GeoUpdater({ userId }: Props) {
  if (!userId) return null

  return <div>GeoUpdater</div>
}

export default GeoUpdater