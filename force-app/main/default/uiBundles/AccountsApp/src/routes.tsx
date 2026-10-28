import type { RouteObject } from 'react-router';
import AppLayout from './appLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { Search as GlobalSearch, config } from "./features/search";
import AccountObjectDetail from "./pages/AccountObjectDetailPage";
import SciChartDemo from "./pages/SciChartDemo";
import FiscalFlow from "./pages/FiscalFlow";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { showInNavigation: true, label: "Home" }
      },
      {
        path: "search",
        element: (
					<GlobalSearch
						config={config}
						title="Search"
						searchPlaceholder="Search accounts, contacts, opportunities, and content..."
					/>
				),
        handle: { showInNavigation: true, label: "Search" }
      },
      {
        path: "scichart",
        element: <SciChartDemo />,
        handle: { showInNavigation: true, label: "SciChart Demo" }
      },
      {
        path: "fiscal-flow",
        element: <FiscalFlow />,
        handle: { showInNavigation: true, label: "Fiscal Flow" }
      },
      {
        path: "accounts/:recordId",
        element: <AccountObjectDetail />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
