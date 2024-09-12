import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { useEffect } from "react";
import { HOST } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { Button } from "../ui/button";
import MultipleSelector from "../ui/multipleselect";
import { addChannel, setTrigger } from "@/store/slices/chat-slices";
import { useSocket } from "@/contexts/SocketContext";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "../ui/responsive-modal";
import { useSelector } from "react-redux";
import { selectedUserData } from "@/store/slices/auth-slices";

const Channel = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [allContact, setAllContact] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    dispatch(setTrigger(true));
    const getData = async () => {
      try {
        const res = await fetch(HOST + "/api/contacts/get-all-contacts", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.erorrs);
        }

        if (res.ok) {
          setAllContact(data.contacts);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    getData();
  }, []);

  const handleCreateChannel = async () => {
    
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const res = await fetch(HOST + "/api/channel/create-channel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          }),
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.errors);
        } else {
          socket.emit("channelCreated", data.channel);
          dispatch(addChannel(data.channel));
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Plus
              onClick={() => {
                
                setNewChannelModal(true);
              }}
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mt-2 p-3 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ResponsiveModal open={newChannelModal} onOpenChange={setNewChannelModal}>
        <ResponsiveModalContent className="bg-[#181920] border-none  text-white w-full md:max-w-[500px] min-h-[400px] flex flex-col">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle
              className={"text-center mb-1 space-y-1 text-white"}
            >
              Please fill up the details for new channel.
            </ResponsiveModalTitle>
            <ResponsiveModalDescription></ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <div className="">
            <Input
              placeholder="Channel Name..."
              className="rounded-lg p-4 text-xs bg-[#2c2e3b] border-none "
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b]  border-none py-3 text-xs text-white"
              defaultOptions={allContact}
              placeholder="Search Contacts..."
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-6 text-gray-600">
                  No result found.
                </p>
              }
            />
          </div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={handleCreateChannel}
            >
              Create Channel
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
};

export default Channel;
