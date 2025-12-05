import Home from "@/features/home/Home";
import NotFound from "@/features/notfound/NotFound";
import RootLayout from "@/layouts/RootLayout";
import { createBrowserRouter } from "react-router-dom";

const routes = [
  {
    // element: <PublicRoute />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [{ index: true, element: <Home /> }],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
