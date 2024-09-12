import Chat from "@/pages/chat";
import { selectedUserData } from "@/store/slices/auth-slices";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const userData = useSelector(selectedUserData);

  const isAuthenticate = !userData;

  return isAuthenticate ? children : <Navigate to={"/chat"} />;
};

export default AuthRoute;
