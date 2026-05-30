import { auth } from "@/auth"
import connectDb from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import User from "@/models/user.model"
import Vehicle from "@/models/vehicles.model"
import PartnerDocs from "@/models/partnerDocs.model"
import PartnerBank from "@/models/partnerBank.model"

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
        const user = await User.findById(id) as any
        if (!user) {
            return NextResponse.json({ message: "Partner not found" }, { status: 404 })
        }

        // Admin review passed - partner moves to onboarding continuation.
        // Use "onboarding" status so they are NOT counted as fully approved
        // until all steps (KYC, pricing, final review, go live) are complete.
        user.partnerStatus = "onboarding"
        user.isPartnerVerified = false  // fully verified only after all steps done
        user.role = "partner"

        // Complete Review step (step 4) → partner can now proceed to Video KYC (step 5)
        if (user.partnerOnboardingSteps === 3) {
            user.partnerOnboardingSteps = 4
        }
        user.partnerRejectionReason = ""

        await user.save()

        // Ensure all 3 sections are fully approved as well
        await Vehicle.updateOne({ owner: id }, { status: "approved" })
        await PartnerDocs.updateOne({ owner: id }, { status: "approved" })
        await PartnerBank.updateOne({ owner: id }, { status: "verified" })

        return NextResponse.json({
            success: true,
            message: "Partner approved successfully and moved to the next onboarding part",
        })
    } catch (error) {
        console.error("Partner final approval POST error:", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
