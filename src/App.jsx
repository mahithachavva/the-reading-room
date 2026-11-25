import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReadingList from "./pages/ReadingList";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Reader from "./pages/Reader";
import Journal from "./pages/Journal";
import "./App.css";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import Favourites from "./pages/Favourites";
import Analytics from "./pages/Analytics";
function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/reading-list" element={<ReadingList />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/reader/:id" element={<Reader />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;