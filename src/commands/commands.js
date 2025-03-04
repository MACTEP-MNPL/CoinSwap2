import {Composer} from "grammy"
import {startCommand} from "./startCommand.js"
import {adminCommand} from "./adminCommand.js"
import {russianCommands} from "./russianCommands.js"
import {topUpBalanceCommands} from "./topUpBalanceCommands.js"  
import {topUpBalanceByNameCommand} from "./topUpBalanceByNameCommand.js"
import {englishCommands} from "./englishCommands.js"
import { duplicateCommands } from "./duplicates.js"

export const commands = new Composer()

commands.use(startCommand)
commands.use(adminCommand)
commands.use(russianCommands)
commands.use(englishCommands)
commands.use(topUpBalanceCommands)
commands.use(duplicateCommands)


//Всегда в конце

commands.use(topUpBalanceByNameCommand)
