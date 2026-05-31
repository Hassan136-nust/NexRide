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

    // Fully approved = admin reviewed AND all remaining steps completed (isPartnerVerified = true)
    const totalApprovedPartners = await User.countDocuments({ partnerStatus: "approved", isPartnerVerified: true })
    const totalRejectedPartners = await User.countDocuments({ partnerStatus: "rejected" })

    // Pending = waiting for admin step-3 review OR in "onboarding" (admin approved, still doing KYC/pricing etc.)
    const pendingFilter = {
      $or: [
        { partnerStatus: "pending" },
        { partnerStatus: "onboarding" },
        { partnerOnboardingSteps: { $gte: 3 }, partnerStatus: { $nin: ["approved", "rejected", "onboarding"] } }
      ]
    }

    const totalPendingPartners = await User.countDocuments(pendingFilter)
    const totalPartners = totalApprovedPartners + totalPendingPartners + totalRejectedPartners

    // Fetch partners needing admin review (step 3 done, not yet reviewed)
    const reviewFilter = {
      $or: [
        { partnerStatus: "pending" },
        { partnerOnboardingSteps: { $gte: 3 }, partnerStatus: { $nin: ["approved", "rejected", "onboarding"] } }
      ]
    }

    const pendingPartnerUsers = await User.find(reviewFilter).lean()

    const partnerIds = pendingPartnerUsers.map((p) => p._id)

    const partnerVehicles = await Vehicle.find({ owner: { $in: partnerIds } }).lean()

    const vehicleTypeMap = new Map(
      partnerVehicles.map((v) => [String(v.owner), v.type])
    )

    const pendingPartnerReviews = pendingPartnerUsers.map((p) => ({
      _id: String(p._id),
      name: p.name,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id)) ?? null,
      partnerOnboardingSteps: p.partnerOnboardingSteps,
    }))

    // Fetch partners waiting for KYC:
    const kycUsers = await User.find({ partnerStatus: "onboarding", partnerOnboardingSteps: 4 }).lean()

    const kycReviews = kycUsers.map((p) => ({
      _id: String(p._id),
      name: p.name,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id)) ?? null, // if not found, it's fine
      partnerOnboardingSteps: p.partnerOnboardingSteps,
    }))

    // Pending vehicles (not yet approved)
    const pendingVehiclesCount = await Vehicle.countDocuments({ status: "pending" })

    return NextResponse.json({
      totalPartners,
      totalApprovedPartners,
      totalPendingPartners,
      totalRejectedPartners,
      pendingPartnerReviews,
      kycReviews,
      pendingVehiclesCount,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
