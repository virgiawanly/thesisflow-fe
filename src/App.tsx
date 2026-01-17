import { Toaster } from "@/components/ui/sonner";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import { LoadingBarContainer } from "react-top-loading-bar";
import { AuthProvider } from "./providers/auth-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { createAppRoutes } from "./routing/app-routing";

const { BASE_URL } = import.meta.env;

export function App() {
  const router = createBrowserRouter(createAppRoutes(), {
    basename: BASE_URL,
  });

  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingBarContainer>
          <Toaster />
          <RouterProvider router={router} />
        </LoadingBarContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
