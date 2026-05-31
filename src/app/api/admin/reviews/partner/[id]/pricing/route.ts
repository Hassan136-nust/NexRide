import { auth } from "@/auth"
import connectDb from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import Vehicle from "@/models/vehicles.model"
import User from "@/models/user.model"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDb()

        const session = await auth()
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const { action, reason } = await req.json() as {
            action: "approve" | "reject"
            reason?: string
        }

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ message: "Invalid action" }, { status: 400 })
        }

        if (action === "reject" && !reason?.trim()) {
            return NextResponse.json({ message: "Rejection reason required" }, { status: 400 })
        }

        const user = await User.findById(id) as any
        if (!user) {
            return NextResponse.json({ message: "Partner not found" }, { status: 404 })
        }

        if (action === "approve") {
            // Advance to step 7 (Final Review / Go-Live)
            user.partnerOnboardingSteps = 7
            user.partnerRejectionReason = ""
            await user.save()

            return NextResponse.json({ success: true, message: "Pricing approved. Partner advanced to Step 7." })
        } else {
            // Reject: reset step back to 5 so partner can re-submit pricing
            user.partnerOnboardingSteps = 5
            user.partnerRejectionReason = reason
            await user.save()

            return NextResponse.json({ success: true, message: "Pricing rejected." })
        }
    } catch (error) {
        console.error("Admin Pricing Review Error:", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
