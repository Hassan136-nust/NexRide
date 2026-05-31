import { auth } from "@/auth"
import connectDb from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import Vehicle from "@/models/vehicles.model"
import User from "@/models/user.model"

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { baseFare, perKmFare, waitingFare } = await req.json()

        if (
            baseFare === undefined ||
            perKmFare === undefined ||
            waitingFare === undefined
        ) {
            return NextResponse.json({ error: "All fares are required" }, { status: 400 })
        }

        // Update Vehicle
        const vehicle = await Vehicle.findOne({ owner: session.user.id })
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        vehicle.baseFare = Number(baseFare)
        vehicle.perKmFare = Number(perKmFare)
        vehicle.waitingFare = Number(waitingFare)
        await vehicle.save()

        // Advance Onboarding Step
        const user = await User.findById(session.user.id)
        if (user && user.partnerOnboardingSteps === 5) {
            user.partnerOnboardingSteps = 6
            await user.save()
        }

        return NextResponse.json({ success: true, message: "Pricing configured successfully" })

    } catch (error) {
        console.error("Pricing API Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
