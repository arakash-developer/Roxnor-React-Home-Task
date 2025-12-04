import { router } from "@/routes/Router";
// import { QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

// const queryClient = new QueryClient();

function App() {
  return (
    <>
      {/* <AuthProvider> */}
      {/* <ToastProvider> */}
      {/* <QueryClientProvider client={queryClient}> */}
      <RouterProvider router={router} />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      {/* <ToastContainer /> */}
      {/* </QueryClientProvider> */}
      {/* </ToastProvider> */}
      {/* </AuthProvider> */}
    </>
  );
}

export default App;
