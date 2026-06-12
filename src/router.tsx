import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthCallbackPage } from './routes/AuthCallbackPage';
import { jaredRouteConfigs, normalRouteConfigs, renderConfiguredRoute } from './routes/routeContent';

export const appRouteObjects: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      ...normalRouteConfigs.map((config) => ({
        path: config.path === '/' ? undefined : config.path.replace(/^\//, ''),
        index: config.path === '/',
        element: renderConfiguredRoute(config)
      })),
      ...jaredRouteConfigs.map((config) => ({
        path: config.path.replace(/^\//, ''),
        element: renderConfiguredRoute(config)
      })),
      {
        path: 'auth/callback',
        element: <AuthCallbackPage />
      }
    ]
  }
];

export function createAppRouter() {
  return createBrowserRouter(appRouteObjects);
}

export function createTestRouter(initialEntries = ['/']) {
  return createMemoryRouter(appRouteObjects, { initialEntries });
}
