import { selectedUserData, setUserData } from "@/store/slices/auth-slices";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { Trash } from "lucide-react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HOST } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useRef } from "react";
import { setChatData } from "@/store/slices/chat-slices";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector(selectedUserData);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    image: null,
  });
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    if (userData.profileSetup) {
      setForm({
        ...form,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
      setSelectedColor(userData.color);
    }

    if (userData.image) {
      setForm({
        ...form,
        image: userData.image,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    }
  }, [userData]);

  const split = () => {
    const result = [];

    const first = form.firstName.split("").shift();
    const last = form.lastName.split("").shift();

    result.push(first);
    result.push(last);

    return result.join("");
  };

  const handleSaveChange = async () => {
    setLoading(true);
    try {
      const res = await fetch(HOST + "/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, color: selectedColor }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errors);
      } else {
        dispatch(setUserData(data.user));
        toast.success(data.message);

        navigate("/chat");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (userData.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please continue to setup your profile.");
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    if (file) {
      const formData = new FormData();

      formData.append("profile-image", file);

      try {
        const res = await fetch(HOST + "/api/auth/add-profile-image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data.image) {
          dispatch(setUserData({ ...userData, image: data.image }));
        }
        e.target.value = null;
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      const res = await fetch(HOST + "/api/auth/remove-profile-image", {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setForm({ ...form, image: "" });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-template h-[100vh] flex-center gap-10 flex-col">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <button onClick={handleBack}>
          <ChevronLeft className="text-4xl w-[40px] h-[40px] text-white/90 cursor-pointer" />
        </button>
        <div className="grid gap-5 md:grid-cols-2">
          <div
            className=" w-32 h-32 md:w-48 md:h-48 relative flex-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {form.image ? (
                <AvatarImage
                  src={form.image}
                  alt="profile"
                  className={"object-cover w-full h-full bg-black"}
                  loading="lazy"
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border flex-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {form.firstName && form.lastName
                    ? split()
                    : userData.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                className="absolute inset-0 flex-center bg-black/50 ring-fuchsia-50 rounded-full"
                onClick={form.image ? handleDeleteImage : handleFileClick}
              >
                {form.image ? (
                  <Trash className="text-white w-[30px] h-[30px] cursor-pointer" />
                ) : (
                  <Plus className="text-white w-[30px] h-[30px] cursor-pointer" />
                )}
              </div>
            )}
            {
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="opacity-0 w-full"
                name="profile-image"
                accept=".png, .jpg, .svg, .jpeg, .webp"
              />
            }
          </div>
          <div className="flex-center min-w-32 gap-5 md:min-w-64 flex-col text-white">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userData.email}
                className={"rounded-lg p-6 bg-[#2c2e3b] border-none"}
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                value={form.firstName}
                maxLength="10"
                onChange={(e) =>
                  setForm((prevState) => ({
                    ...prevState,
                    firstName: e.target.value,
                  }))
                }
                className={"rounded-lg p-6 bg-[#2c2e3b] border-none"}
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                maxLength="10"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prevState) => ({
                    ...prevState,
                    lastName: e.target.value,
                  }))
                }
                className={"rounded-lg p-6 bg-[#2c2e3b] border-none"}
              />
            </div>
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedColor === index
                      ? "outline outline-white/100 outline-1"
                      : ""
                  }`}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="p-6 text-xs w-full bg-purple-700 hover:bg-purple-900 disabled:bg-purple-500 transition-all duration-300"
            onClick={handleSaveChange}
            disabled={loading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
