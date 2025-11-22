import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/ThemeProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <>
          <SignedIn>
            <Dashboard />
          </SignedIn>
          <SignedOut>
            <Landing />
          </SignedOut>
        </>
      )} />
      {/* Protected Routes Fallback */}
      <Route path="/dashboard" component={() => (
        <>
          <SignedIn>
            <Dashboard />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
