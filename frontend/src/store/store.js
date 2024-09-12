import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slices";
import chatReducer from "./slices/chat-slices";
import usersReducer from "./slices/users-slices";

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    users: usersReducer,
  },
});

export default store;
