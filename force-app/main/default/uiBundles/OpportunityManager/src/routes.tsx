import type { RouteObject } from 'react-router';
import AppLayout from '@/appLayout';
import OpportunityManagerPage from './pages/OpportunityManagerPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OpportunityManagerPage /> },
      { path: '*', element: <OpportunityManagerPage /> },
    ],
  },
];
