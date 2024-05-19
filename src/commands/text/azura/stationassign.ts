import axios from "axios";
import { TextCommand } from "../../../classes/command/text.js";
import { Vars, prisma } from "../../../index.js";
import { HandleAxiosError } from "../../../utils/handleAxiosError.js";

export default new TextCommand({
  name: "stationassign",
  execute: async ({ message, args }) => {
    if (!args.length) {
      message.reply("Please provide a station ID.");
      return;
    }

    let channelSpecified = message.mentions.channels.first();

    if (!channelSpecified) {
      message.reply("Please mention a channel.");
      return;
    }

    try {
      const response = await axios.get(
        `${Vars.AZURACAST_API_URL}/station/${args[0]}`,
        {
          headers: {
            "X-API-Key": Vars.AZURACAST_API_KEY,
          },
        }
      );

      const channel = await prisma.channel.findFirst({
        where: {
          id: channelSpecified.id,
        },
      });

      if (!channel) {
        await prisma.channel.create({
          data: {
            id: channelSpecified.id,
            radioStation: response.data.id,
          },
        });
        message.reply(
          `Channel ${channelSpecified.url} has been assigned to ${response.data.name}`
        );
      }
    } catch (error: unknown) {
      const msg = HandleAxiosError(error);
      message.reply(msg);
    }
  },
});
