import { createHashRouter } from "react-router";
import { RootLayout, ErrorPage } from "./components/RootLayout";
import { PicturesAndMapScreen } from "./components/PicturesAndMapScreen";
import { CustomRouteScreen } from "./components/CustomRouteScreen";

export const router = createHashRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true,          Component: PicturesAndMapScreen },
      { path: "custom-route", Component: CustomRouteScreen },
      { path: "*",            Component: PicturesAndMapScreen },
    ],
  },
]);
