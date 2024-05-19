import { BotEvent } from "../classes/event.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { isAxiosError, AxiosError } from "axios";
import { Vars } from "../index.js";
import { ActivityType } from "discord.js";
import { HandleAxiosError } from "../utils/handleAxiosError.js";

export default new BotEvent("ready", async (client) => {
  console.log(`Logged in as ${client.user?.tag}`);

  // check if the azuracast api is reachable
  // if it is, set the status to the instance name
  // if it isn't, set the status to "Playing ~help"
  try {
    const response = await axios.get(
      `${Vars.AZURACAST_API_URL}/admin/settings`,
      {
        headers: {
          "X-API-Key": Vars.AZURACAST_API_KEY,
        },
      }
    );

    console.log(`Connected to ${response.data.instance_name} API`);

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
          type: ActivityType.Playing,
        },
      ],
    });
  }
});
