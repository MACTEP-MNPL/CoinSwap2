import { Composer } from "grammy";
import { make1lvlAdminConversation, make2lvlAdminConversation, makeUserConversation } from "./manageAdminsConversations.js";
import { createConversation } from "@grammyjs/conversations";
import { updateCityMarginConversation } from "./manageTarifsConversations.js";
import { deleteAccount } from "./deleteAccountConversation.js";
export const convers = new Composer()


convers.use(createConversation(makeUserConversation))
convers.use(createConversation(make1lvlAdminConversation))
convers.use(createConversation(make2lvlAdminConversation))
convers.use(createConversation(updateCityMarginConversation))
convers.use(createConversation(deleteAccount))

