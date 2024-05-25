import { _GetVariables } from "./utils/getVariables.js";
import AzuraBot from "./classes/bot.js";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { AzuraCastClient } from "azuracast.js";
import { Log } from "./classes/log.js";

export const Vars = _GetVariables();
export const prisma = new PrismaClient();
export const azuraClient = new AzuraCastClient({
  apiKey: Vars.AZURACAST_API_KEY,
  apiUrl: Vars.AZURACAST_API_URL,
});
export const Bot = new AzuraBot();

Bot.initCommands()
  .catch(Log.error)
  .then(() => Bot.start(Vars.BOT_TOKEN));
