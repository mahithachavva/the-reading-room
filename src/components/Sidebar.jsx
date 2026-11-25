import {
  LayoutDashboard,
  BookOpen,
  Library,
  BookMarked,
  NotebookPen,
  Trophy,
  ChartNoAxesColumn,
  Settings,
  Heart,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={19} /> },
    { name: "My Library", path: "/library", icon: <Library size={19} /> },
    { name: "Favourites", path: "/favourites", icon: <Heart size={19} /> },
    { name: "Reading List", path: "/reading-list", icon: <BookMarked size={19} /> },
    { name: "Reader", path: "/reader", icon: <BookOpen size={19} /> },
    { name: "Reading Journal", path: "/journal", icon: <NotebookPen size={19} /> },
  ];

  const progress = [
    { name: "Achievements", path: "/achievements", icon: <Trophy size={19} /> },
    { name: "Analytics", path: "/analytics", icon: <ChartNoAxesColumn size={19} /> },
  ];

  return (
    <aside className="sidebar">

      <div className="brand">
        <BookOpen size={27} />
        <div>
          <h2>The Reading Room</h2>
          <span>YOUR PERSONAL LIBRARY</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="section-title">MENU</p>

        <nav>
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <p className="section-title">YOUR PROGRESS</p>

        <nav>
          {progress.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-link">
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <div className="sidebar-quote">
          "A room without books is like a body without a soul."
          <span>— Cicero</span>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;