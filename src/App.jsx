import Sidebar from "./components/Sidebar";
import "./App.css";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <>
      <main className="flex gap-0 md:gap-5">
        {/* Sidebar: fixed for desktop/tablet, overlays for mobile */}
        <aside className="fixed left-0 top-0 h-screen z-30 w-16 md:w-64">
          <Sidebar />
        </aside>
        {/* Main content: margin-left matches sidebar width on md+, none on mobile */}
        <main className="flex-1 p-2 sm:p-4 ml-12 md:ml-64 transition-all duration-300">
          <AppRoutes />
        </main>
      </main>
    </>
  );
}

export default App;
