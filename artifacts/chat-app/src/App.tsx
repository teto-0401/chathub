import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { useEffect } from "react";

import ChatPage from "@/pages/ChatPage";
import SetupPage from "@/pages/SetupPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isLoading } = useAppContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      setLocation("/setup");
    }
  }, [currentUser, isLoading, setLocation]);

  if (isLoading) return null;
  if (!currentUser) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/setup" component={SetupPage} />
      <Route path="/">
        <ProtectedRoute component={ChatPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
