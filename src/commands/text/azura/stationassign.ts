import { TextCommand } from "../../../classes/command/text.js";
import { azuraClient, prisma } from "../../../index.js";
import { HandleAxiosError } from "../../../utils/handleAxiosError.js";

export default new TextCommand({
  name: "stationassign",
  execute: async ({ message, args }) => {
    if (!args.length) {
      message.reply("Please provide a station ID.");
      return;
    }

    const channelSpecified = message.mentions.channels.first();

    if (!channelSpecified) {
      message.reply("Please mention a channel.");
      return;
    }

    try {
      const station = await azuraClient.Stations.get(args[0]);

      const channel = await prisma.channel.findFirst({
        where: {
          id: channelSpecified.id,
        },
      });

      if (!channel) {
        await prisma.channel.create({
          data: {
            id: channelSpecified.id,
            radioStation: station.id,
          },
        });
        message.reply(
          `Channel ${channelSpecified.url} has been assigned to ${station.name}`
        );
      }
    } catch (error: unknown) {
      const msg = HandleAxiosError(error);
      message.reply(msg);
    }
  },
});
