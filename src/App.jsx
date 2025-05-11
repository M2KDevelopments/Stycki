import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import PageHome from "./pages/PageHome";
import PageShare from "./pages/PageShare";

function App() {

  return (
    <div className="main">
      <Router>
        <Routes>
          <Route path="/" element={<PageHome />} />
          <Route path="/share" element={<PageShare />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;
