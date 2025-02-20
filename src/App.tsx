import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landing";
import QuizPage from "./components/quiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
