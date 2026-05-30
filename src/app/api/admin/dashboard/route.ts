import { auth } from "@/auth"
import connectDb from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import User from "@/models/user.model"
import Vehicle from "@/models/vehicles.model"

export async function GET(req: NextRequest) {
  try {
    await connectDb()

    const session = await auth()

    if (!session || !session.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only count users who have actually started onboarding (steps > 0)
    const onboardingFilter = { partnerOnboardingSteps: { $gt: 0 } }

    const totalPartners = await User.countDocuments(onboardingFilter)

    const totalApprovedPartners = await User.countDocuments({
      ...onboardingFilter,
      partnerStatus: "approved",
    })

    const totalPendingPartners = await User.countDocuments({
      ...onboardingFilter,
      partnerStatus: "pending",
    })

    const totalRejectedPartners = await User.countDocuments({
      ...onboardingFilter,
      partnerStatus: "rejected",
    })

    // Users who completed all 3 onboarding steps and are still pending review
    const pendingPartnerUsers = await User.find({
      partnerOnboardingSteps: { $gte: 3 },
      partnerStatus: "pending",
    })

    const partnerIds = pendingPartnerUsers.map((p) => p._id)

    const partnerVehicles = await Vehicle.find({ owner: { $in: partnerIds } })

    const vehicleTypeMap = new Map(
      partnerVehicles.map((v) => [String(v.owner), v.type])
    )

    const pendingPartnerReviews = pendingPartnerUsers.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id)) ?? null,
    }))

    return NextResponse.json({
      totalPartners,
      totalApprovedPartners,
      totalPendingPartners,
      totalRejectedPartners,
      pendingPartnerReviews,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
