
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "@/context/SocketContext";

// Pages
import Index from "./pages/Index";
import HostPage from "./pages/HostPage";
import RoomPage from "./pages/RoomPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
