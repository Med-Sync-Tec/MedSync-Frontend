import { Navigate, type RouteObject } from 'react-router-dom';
import { AuthLayout, DoctorLayout } from '@layouts/index';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { ConsultationHistoryPage } from '@features/consultations/pages/ConsultationHistoryPage';
import { NewSOAPEntryPage } from '@features/consultations/pages/NewSOAPEntryPage';
import { DoctorDashboardPage } from '@features/doctor';
import { PatientsListPage } from '@features/patients/pages/PatientsListPage';
import { SavedNewsPage } from '@features/news/pages/SavedNewsPage';
import { NotFoundPage } from './NotFoundPage';
import { RequireAuth } from './RequireAuth';
import { RedirectIfAuth } from './RedirectIfAuth';

export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: (
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        ),
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <DoctorLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/doctor/dashboard', element: <DoctorDashboardPage /> },
      { path: '/doctor/patients', element: <PatientsListPage /> },
      { path: '/doctor/saved-news', element: <SavedNewsPage /> },
      { path: '/patients/:patientId/history', element: <ConsultationHistoryPage /> },
      { path: '/patients/:patientId/consultas/new', element: <NewSOAPEntryPage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
];
