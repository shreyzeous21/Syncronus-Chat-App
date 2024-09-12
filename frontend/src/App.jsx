import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import AuthRoute from "./routes/AuthRoute";
import PrivateRoute from "./routes/PrivateRoute";
import { useSelector } from "react-redux";
import { selectedUserData, setUserData } from "./store/slices/auth-slices";

import { HOST } from "./utils/constant";

import { useDispatch } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";

function App() {
  const userData = useSelector(selectedUserData);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(HOST + "/api/auth/user-data", {
          methods: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data.user._id) {
          dispatch(setUserData(data.user));
        }
      } catch (error) {
        dispatch(setUserData(undefined));
      } finally {
        setLoading(false);
      }
    };

    if (!userData) {
      fetchData();
    }
  }, []);

  if (loading) {
    return (
      <div
        className={`flex items-center flex-col bg-template justify-center h-screen`}
      >
{/*         <div className="relative">
          <div className="h-20 w-20 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-t-8 border-b-8 border-purple-700 animate-spin"></div>
        </div>
        <div className="text-white mt-2">Loading...</div> */}
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={"/auth"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
