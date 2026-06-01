import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/auth'
import connectDb from '@/lib/db'
import Booking from '@/models/booking.model'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const body = await req.json()
        const { status, paymentStatus, partnerId } = body

        await connectDb()

        const booking = await Booking.findById(id)
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        const sessionUser = session.user as { id: string; role: string }

        // If a partner calls, verify partner ownership/permissions
        if (sessionUser.role === 'partner') {
            // If the booking is not assigned to a partner, assign it on confirmation
            if (status === 'confirmed' && !booking.partner) {
                booking.partner = new Types.ObjectId(sessionUser.id)
            } else if (booking.partner && booking.partner.toString() !== sessionUser.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        // Update status transitions
        if (status) {
            booking.status = status
        }
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus
        }
        if (partnerId) {
            booking.partner = partnerId
        }

        await booking.save()

        return NextResponse.json({
            success: true,
            message: 'Booking updated successfully',
            booking,
        })
    } catch (error) {
        console.error('Update booking error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
