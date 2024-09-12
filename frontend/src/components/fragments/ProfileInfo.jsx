import { getColor } from "@/lib/utils";
import { selectedUserData, setUserData } from "@/store/slices/auth-slices";
import { setChatType } from "@/store/slices/chat-slices";
import { setOnlineStatus } from "@/store/slices/users-slices";
import { HOST } from "@/utils/constant";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { EditIcon } from "lucide-react";
import { CirclePower } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector(selectedUserData);

  const split = () => {
    const result = [];

    const first = userData?.firstName.split("").shift();
    const last = userData?.lastName.split("").shift();

    result.push(first);
    result.push(last);

    return result.join("");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(HOST + "/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        dispatch(setOnlineStatus({}));
        dispatch(setUserData(undefined));

        navigate("/auth");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-4 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-10 h-10 rounded-full relative">
          <Avatar>
            {userData.image ? (
              <AvatarImage
                src={userData.image}
                alt="profile"
                className={"object-cover w-full h-full rounded-full  bg-black"}
                loading="lazy"
              />
            ) : (
              <div
                className={`uppercase h-10 w-10  text-xs border flex-center rounded-full ${getColor(
                  userData.color
                )}`}
              >
                {userData?.firstName && userData?.lastName
                  ? split()
                  : userData.email.split("").shift()}
              </div>
            )}
          </Avatar>
        </div>
        <div>
          {userData.firstName && userData.lastName ? (
            <span className="text-sm lg:text-sm">{`${userData.firstName} ${userData.lastName}`}</span>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="p-2">
              <EditIcon
                className="text-purple-500 text-medium w-5 h-5"
                onClick={() => navigate("/profile")}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none p-2  text-white">
              Edit Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="p-2">
              <CirclePower
                className="text-red-500 text-medium w-5 h-5"
                onClick={handleLogout}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none p-2  text-white">
              Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
