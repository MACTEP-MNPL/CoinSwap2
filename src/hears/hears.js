import { Composer } from "grammy";
import {adminPanelHears} from "./adminPanelHears.js"
import {backHears} from "./backHears.js"
import {adminsHears} from "./adminsHears.js"
import {citiesHears} from "./citiesHears.js"
import {forexHears} from "./forexHears.js"
import {usdtExHears} from "./usdtExHears.js"
import {tarifsHears} from "./tarifsHears.js"
import { totalHears } from "./totalHears.js"
import { ExHears } from "./XeHears.js"


export const hears = new Composer()

hears.use(adminPanelHears)
hears.use(backHears)
hears.use(adminsHears)
hears.use(citiesHears)
hears.use(forexHears)
hears.use(usdtExHears)
hears.use(tarifsHears)
hears.use(totalHears)   
hears.use(ExHears)
