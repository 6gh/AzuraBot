import { _GetVariables } from "./utils/getVariables.js";
import AzuraBot from "./classes/bot.js";
import "dotenv/config";

export const Vars = _GetVariables();
export const Bot = new AzuraBot();

Bot.initCommands()
  .catch(console.error)
  .then(() => Bot.start(Vars.BOT_TOKEN));
