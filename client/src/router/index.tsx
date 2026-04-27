import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/global-context/auth-context/useAuth";
import { Navbar } from "@/components/navbar";

import RegisterPage from "@/pages/register";
import LoginPage from "@/pages/login";
import GeneralPage from "../pages";
import CompetenciesPage from "@/pages/competencies";
import TestsPage from "@/pages/tests";
import CreatedTestPage from "@/pages/tests/[testId]";
import UploadDocsPage from "@/pages/tests/create/[testId]/upload-documents";
import CreateQuestionsPage from "@/pages/tests/create/[testId]/questions";
import CreateFinalPage from "@/pages/tests/create/[testId]/final";
import CreateTestLayout from "@/pages/tests/create/layout";

export default function AppRouter() {
  const { user } = useAuth();

  const Login = user ? <Navigate to={'/'} /> : <LoginPage />;
  const Register = user ? <Navigate to={'/'} /> : <RegisterPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={Login} />
        <Route path="/register" element={Register} />

        <Route element={
          <>
            <Navbar />
            <Outlet />
          </>
        }>
          <Route path="/" element={<GeneralPage />} />
          <Route path="/competencies" element={<CompetenciesPage />} />

          <Route path="/tests">
            <Route index element={<TestsPage />} />

            <Route path="create">
              <Route index element={<Navigate to="/tests" replace />} />

              <Route path=":testId" element={<CreateTestLayout />}>
                <Route index element={<Navigate to="upload-documents" replace />} />
                <Route path="upload-documents" element={<UploadDocsPage />} />
                <Route path="questions" element={<CreateQuestionsPage />} />
                <Route path="final" element={<CreateFinalPage />} />
              </Route>
            </Route>

            <Route path=":testId" element={<CreatedTestPage />} />
          </Route>
          {/* <Route element={<ProtectedRoute user={user} allowedRoles={['admin', 'moderator', 'viewer']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route> */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
