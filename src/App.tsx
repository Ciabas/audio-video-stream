import { FC } from "react";
import "./index.css";
import RTCManually from "./pages/RTCManually.tsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SendingBloBChunks from "./pages/SendingBlobChunks.tsx";

const router = createBrowserRouter([
  {
    path: "/chunks",
    element: <SendingBloBChunks />,
  },
  { path: "/manual-rtc", element: <RTCManually /> },
  { path: "*", element: <div />, index: true },
]);

const App: FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <a href="/manual-rtc">Manual RTC</a>
      <br />
      <a href="/chunks">Websocket chunks</a>
    </>
  );
};

export default App;
