'use client'
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useState } from "react";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "signup">("login");

  const openLogin = () => { setAuthStep("login"); setAuthOpen(true); };
  const openSignup = () => { setAuthStep("signup"); setAuthOpen(true); };

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav onLoginClick={openLogin} onSignupClick={openSignup} />
      <PublicHome onAuthRequired={openLogin} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialStep={authStep} />
      <Footer />
    </div>
  );
}
