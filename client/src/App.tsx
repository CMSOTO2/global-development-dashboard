import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { GlobalDevelopmentDashboard } from "./components/GlobalDevelopmentDashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-zinc-950 transition-colors duration-200">
          <header className="sticky top-0 z-10 shrink-0 border-b border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <h1 className="text-base font-medium text-slate-800 dark:text-zinc-200 tracking-tight truncate">
                Global Development Dashboard
              </h1>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 min-h-0 overflow-auto">
            <GlobalDevelopmentDashboard />
          </main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
