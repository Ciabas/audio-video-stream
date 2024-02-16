import { FC } from "react";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SendingBloBChunks from "./pages/SendingBlobChunks.tsx";

const router = createBrowserRouter([
  {
    path: "/chunks",
    element: <SendingBloBChunks />,
  },
  { path: "*", element: <div />, index: true },
]);

const App: FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <a href="/chunks">Websocket chunks</a>
    </>
  );
};

export default App;
