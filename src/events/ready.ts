import { BotEvent } from "../classes/event.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { isAxiosError, AxiosError } from "axios";
import { Vars } from "../index.js";
import { ActivityType } from "discord.js";
import { HandleAxiosError } from "../utils/handleAxiosError.js";
import { Log } from "../classes/log.js";

export default new BotEvent("ready", async (client) => {
  Log.info(`Logged in as ${client.user?.tag}`);

  // check if the azuracast api is reachable
  // if it is, set the status to the instance name
  // if it isn't, set the status to "Playing ~help"
  try {
    const response = await axios.get(
      `${Vars.AZURACAST_API_URL}/api/admin/settings`,
      {
        headers: {
          "X-API-Key": Vars.AZURACAST_API_KEY,
        },
      }
    );

    Log.info(`Connected to ${response.data.instance_name} API`);

    client.user?.setPresence({
      activities: [
        {
          name: response.data.instance_name || "~help",
          type: ActivityType.Listening,
        },
      ],
    });
  } catch (error: AxiosError | unknown) {
    HandleAxiosError(error);

    client.user?.setPresence({
      activities: [
        {
          name: "~help",
          type: ActivityType.Listening,
        },
      ],
    });
  }
});
