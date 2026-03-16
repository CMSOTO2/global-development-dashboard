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
          <header className="sticky top-0 z-10 shrink-0 border-b border-slate-200/60 dark:border-zinc-800 bg-slate-50/95 dark:bg-zinc-900/80 backdrop-blur-sm">
            <div className="max-w-[1440px] mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                Global Development Dashboard
              </span>
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
