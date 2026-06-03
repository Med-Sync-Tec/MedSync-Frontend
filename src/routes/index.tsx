import { Navigate, type RouteObject } from 'react-router-dom';
import { AuthLayout, DoctorLayout, CooLayout } from '@layouts/index';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { PrivacyPage } from '@features/legal/pages/PrivacyPage';
import { TermsPage } from '@features/legal/pages/TermsPage';
import { ConsultationHistoryPage } from '@features/consultations/pages/ConsultationHistoryPage';
import { NewSOAPEntryPage } from '@features/consultations/pages/NewSOAPEntryPage';
import { DoctorDashboardPage } from '@features/doctor';
import { PatientsListPage } from '@features/patients/pages/PatientsListPage';

import { CooDashboardPage } from '@features/coo/pages/CooDashboardPage';
import { MedicationNewsPage } from '@features/coo/pages/MedicationNewsPage';
import { InventoryPage } from '@features/inventory/pages/InventoryPage';
import { CreateDoctorPage } from '@features/admin';
import { ProfilePage } from '@features/profile';
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
      { path: '/doctor/profile', element: <ProfilePage /> },

      { path: '/patients/:patientId/history', element: <ConsultationHistoryPage /> },
      { path: '/patients/:patientId/consultas/new', element: <NewSOAPEntryPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <CooLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/coo/dashboard', element: <CooDashboardPage /> },
      { path: '/coo/medication-news', element: <MedicationNewsPage /> },
      { path: '/coo/profile', element: <ProfilePage /> },

      { path: '/coo/inventory', element: <InventoryPage /> },
      { path: '/coo/doctors/new', element: <CreateDoctorPage /> },
    ],
  },
  { path: '/privacidad', element: <PrivacyPage /> },
  { path: '/terminos', element: <TermsPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
];
