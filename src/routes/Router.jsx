import Basics from "@/features/basics/Basics";
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
        children: [
          { index: true, element: <Home /> },
          { path: "basics", element: <Basics /> },
        ],
      },
    ],
  },
  //   {
  //     element: <ProtectedRoute allowedRoles={["receiption"]} />,
  //     children: [
  //       {
  //         path: "/receiption",
  //         element: <ReceiptionLayout />,
  //         children: [
  //           { index: true, element: <AdminDashboard /> },
  //           { path: "add-country", element: <Country /> },
  //           { path: "add-test", element: <Test /> },
  //           { path: "add-department", element: <Department /> },
  //           { path: "add-category", element: <Category /> },
  //           { path: "add-table", element: <Table /> },
  //           { path: "add-tableidfield", element: <TableIdField /> },
  //           { path: "doctor", element: <Doctor /> },
  //           { path: "patient-registration", element: <PatientReg /> },
  //           { path: "due-collection", element: <Due /> },
  //           { path: "statement", element: <Statement /> },
  //           { path: "search-patient-info", element: <Patientinfo /> },
  //           { path: "refferel-doctor", element: <RefferelDoctor /> },
  //           { path: "outdoor-income", element: <OutdoorIncome /> },
  //           {
  //             path: "outdoor-income-statement",
  //             element: <Outdoorincomestatement />,
  //           },
  //           {
  //             path: "outdoor-income-statement/outdoor-statement/:startingBackendDate/:endingBackendDate",
  //             element: <OutdoorStatement />,
  //           },
  //           { path: "periodical-report", element: <PeriodicalReport /> },
  //           { path: "periodical-statement", element: <PeriodicalStatement /> },
  //           { path: "user-wise-report", element: <UserWiseReport /> },
  //           { path: "user-wise-statement", element: <UserWiseStatement /> },
  //           { path: "group-wise-report", element: <GroupWiseReport /> },
  //           { path: "group-wise-statement", element: <GroupWiseStatement /> },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     element: <ProtectedRoute allowedRoles={["admin"]} />,
  //     children: [
  //       {
  //         path: "/admin",
  //         element: <AdminDashboardLayout />,
  //         children: [
  //           { index: true, element: <AdminDashboard /> },
  //           { path: "analytics", element: <AdminDashboard /> },
  //           { path: "typography", element: <Typhography /> },
  //           { path: "patients", element: <AdminPatients /> },
  //           { path: "accounts", element: <AdminAccounts /> },
  //           { path: "doctors", element: <AdminDoctors /> },
  //           { path: "pathology", element: <AdminPathology /> },
  //           { path: "connections", element: <AdminConnections /> },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     element: <ProtectedRoute allowedRoles={["superadmin"]} />,
  //     children: [
  //       {
  //         path: "/",
  //         element: <AdminDashboardLayout />,
  //         children: [{ path: "superadmin", element: <SuperAdminDashboard /> }],
  //       },
  //     ],
  //   },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
