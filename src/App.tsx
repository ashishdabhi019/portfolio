import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const GreoPage = lazy(() => import("./components/GreoPage"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
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

              {/* Greo Overlay Route */}
              <Routes>
                <Route
                  path="/greo"
                  element={
                    <Suspense fallback={null}>
                      <GreoPage />
                    </Suspense>
                  }
                />
              </Routes>
            </LoadingProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
