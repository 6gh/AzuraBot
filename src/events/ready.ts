import { BotEvent } from "../classes/event.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { isAxiosError, AxiosError } from "axios";
import { Vars } from "../index.js";
import { ActivityType } from "discord.js";

export default new BotEvent("ready", async (client) => {
  console.log(`Logged in as ${client.user?.tag}`);

  // check if the azuracast api is reachable
  // if it is, set the status to the instance name
  // if it isn't, set the status to "Playing ~help"
  try {
    const response = await axios.get(
      "https://radio.blackmidi.wiki/api/admin/settings",
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
    if (!isAxiosError(error) || !error.response) {
      // Something happened in setting up the request that triggered an Error
      console.error(
        "[ERROR] Failed to reach AzuraCast API. An unknown error occurred."
      );
      console.error(error);
    } else {
      if (error.response.status === 404) {
        // Not found
        console.error(
          "[ERROR] Failed to reach AzuraCast API. Check your API URL."
        );
      } else if (error.response.status === 403) {
        // Forbidden
        console.error(
          "[ERROR] Failed to reach AzuraCast API. Check your API Key."
        );
      } else if (error.response.status === 500) {
        // Unauthorized
        console.error(
          "[ERROR] Failed to reach AzuraCast API. Server error, please try again later."
        );
      }

      console.error(error.response.data);
      console.error(error.response.headers);
    }

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
