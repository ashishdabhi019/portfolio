import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Remove legacy /greo path immediately on load and replace with root
if (
  typeof window !== "undefined" &&
  (window.location.pathname === "/greo" ||
    window.location.pathname.startsWith("/greo/"))
) {
  window.history.replaceState(null, "", "/");
}

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect /greo path directly to root */}
        <Route path="/greo/*" element={<Navigate to="/" replace />} />
        <Route path="/greo" element={<Navigate to="/" replace />} />

        {/* Main portfolio - Always rendered to preserve state & scroll */}
        <Route
          path="/*"
          element={
            <LoadingProvider>
              <Suspense>
                <MainContainer>
                  <Suspense>
                    <CharacterModel />
                  </Suspense>
                </MainContainer>
              </Suspense>
            </LoadingProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
