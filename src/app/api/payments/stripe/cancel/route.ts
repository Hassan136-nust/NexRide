import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const bookingId = url.searchParams.get('bookingId')
    const redirect = new URL('/user/checkout', req.url)
    if (bookingId) redirect.searchParams.set('cancelled', 'true')

    // Redirect back with a cancellation signal (client will handle UI message)
    return NextResponse.redirect(new URL('/user/bookings?payment=cancelled', req.url))
}
