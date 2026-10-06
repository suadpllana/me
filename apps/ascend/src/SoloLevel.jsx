import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProgressProvider } from "./hooks/useLocalStorage";
import GameProvider from "./components/GameProvider";
import ToastProvider from "./components/feedback/ToastProvider";
import FxProvider from "./components/feedback/FxProvider";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import BottomNav from "./components/layout/BottomNav";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import StatsPage from "./pages/StatsPage";

// Jump back to the top whenever the route changes (the router otherwise keeps
// the previous scroll position).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function SoloLevel() {
  return (
    <ProgressProvider>
      <GameProvider>
        <ToastProvider>
          <FxProvider>
            <ScrollToTop />
            <Sidebar />
            <div className="min-h-dvh lg:pl-[272px]">
              <TopBar />
              <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-10 pt-5 lg:pt-[calc(2.25rem+env(safe-area-inset-top,0px))] pb-[calc(var(--nav-h)+var(--safe-bottom)+28px)] lg:pb-16">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/:id" element={<CategoryPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <BottomNav />
          </FxProvider>
        </ToastProvider>
      </GameProvider>
    </ProgressProvider>
  );
}
