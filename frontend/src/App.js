import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HandrianPortfolio from "@/pages/HandrianPortfolio";

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HandrianPortfolio />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
