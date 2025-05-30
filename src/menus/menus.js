import { Composer } from "grammy";
import { manageAdminsMenu } from "./manageAdminsMenus.js";
import { undoMenus } from "./undoMenus.js";
import { manageTarifsMenu } from "./manageTarifsMenu.js";
import { cityTarifMenu } from "./manageTarifsMenu.js";
export const menus = new Composer()

menus.use(manageAdminsMenu)
menus.use(undoMenus)
menus.use(cityTarifMenu)
menus.use(manageTarifsMenu)
