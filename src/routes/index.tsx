import { Navigate, type RouteObject } from 'react-router-dom';
import { AuthLayout, DoctorLayout } from '@layouts/index';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { ConsultationHistoryPage } from '@features/consultations/pages/ConsultationHistoryPage';
import { NewSOAPEntryPage } from '@features/consultations/pages/NewSOAPEntryPage';
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
      { path: '/medical-record/history', element: <ConsultationHistoryPage /> },
      { path: '/medical-record/new-soap', element: <NewSOAPEntryPage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
];
