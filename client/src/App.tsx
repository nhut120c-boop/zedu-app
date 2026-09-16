import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import Assignments from "./pages/Assignments";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import StudyHub from "./pages/StudyHub";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/auth" component={Auth} />
    <Route path="/lessons" component={Lessons} />
    <Route path="/assignments" component={Assignments} />
    <Route path="/on-thi" component={StudyHub} />
    <Route path="/kiem-tra" component={StudyHub} />
    <Route path="/messages" component={Messages} />
    <Route path="/giao-vien" component={Admin} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
