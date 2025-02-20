import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landing";
import QuizPage from "./components/quiz";
import ResultsPage from "./components/result";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
