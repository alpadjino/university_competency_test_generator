import { AuthProvider } from "./global-context/auth-context/auth-provider";
import { Toaster } from "@/components/ui/sonner"
import AppRouter from "./router";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <AppRouter />
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
