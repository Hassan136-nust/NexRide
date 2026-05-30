'use client'

import { useState } from "react";
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import PartnerDashboard from "@/components/PartnerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "signup">("login");

  const userData = useSelector((state: RootState) => state.user.userData);

  const openLogin = () => {
    setAuthStep("login");
    setAuthOpen(true);
  };

  const openSignup = () => {
    setAuthStep("signup");
    setAuthOpen(true);
  };

  const renderContent = () => {
    if (!userData) return <PublicHome onAuthRequired={openLogin} />;

    if (userData.role === "admin") return <AdminDashboard />;

    // Partner: only show PartnerDashboard if verified, otherwise show onboarding dashboard
    if (userData.role === "partner" && userData.isPartnerVerified) {
      return <PartnerDashboard />;
    }

    // User who has started onboarding (partnerOnboardingSteps > 0) or is unverified partner
    if (userData.partnerOnboardingSteps > 0 || userData.role === "partner") {
      return <PartnerDashboard />;
    }

    return <PublicHome onAuthRequired={openLogin} />;
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav onLoginClick={openLogin} onSignupClick={openSignup} />

      {renderContent()}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialStep={authStep}
      />

      <Footer />
    </div>
  );
}
