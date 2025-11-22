import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Shield, Clock, Zap, BarChart3 } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse" />

      {/* Header with theme toggle */}
      <header className="relative z-10 glass-strong border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow-purple">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LibraryLive</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 glow-purple">
            <Users className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold">
              <span className="gradient-text">Library Occupancy</span>
              <br />
              <span className="text-foreground">Dashboard</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real-time visitor tracking system for monitoring library capacity and occupancy status with cutting-edge technology
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="gap-3 text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 glow-purple transition-all duration-300 hover:scale-105"
                data-testid="button-login"
              >
                Sign In to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Button>
            </SignInButton>
          </div>

          <p className="text-sm text-muted-foreground">
            Sign in with Google, GitHub, or email • Free to use
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="glass-strong gradient-border hover:glow-cyan transition-all duration-300 hover:-translate-y-2" data-testid="card-feature-realtime">
            <CardContent className="p-8 space-y-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center glow-cyan">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Real-Time Updates
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor library occupancy in real-time with automatic updates every 5 seconds. Never miss a change in visitor count.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong gradient-border hover:glow-purple transition-all duration-300 hover:-translate-y-2" data-testid="card-feature-secure">
            <CardContent className="p-8 space-y-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow-purple">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Secure Authentication
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade security with Clerk authentication. Your data is protected with industry-standard encryption.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong gradient-border hover:glow-pink transition-all duration-300 hover:-translate-y-2" data-testid="card-feature-analytics">
            <CardContent className="p-8 space-y-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center glow-pink">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Advanced Analytics
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track peak occupancy, entry/exit patterns, and capacity utilization with detailed analytics and insights.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mt-16 glass-strong rounded-2xl p-10 gradient-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">Lightning Fast</h4>
              </div>
              <p className="text-muted-foreground">
                Built with modern web technologies for optimal performance and responsiveness.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">User Friendly</h4>
              </div>
              <p className="text-muted-foreground">
                Intuitive interface designed for ease of use with minimal training required.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>© 2025 LibraryLive. Built with modern web technologies.</p>
        </footer>
      </div>
    </div>
  );
}
