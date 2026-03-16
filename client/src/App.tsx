import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EconomicHistory } from "./components/EconomicHistory";
import { EconomicLatest } from "./components/EconomicLatest";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <EconomicHistory />
      <EconomicLatest />
    </QueryClientProvider>
  );
}

export default App;
