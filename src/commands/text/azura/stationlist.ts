import { TextCommand } from "../../../classes/command/text.js";
import { azuraClient } from "../../../index.js";
import { HandleAxiosError } from "../../../utils/handleAxiosError.js";
import { APIEmbedField, EmbedBuilder } from "discord.js";

export default new TextCommand({
  name: "stationlist",
  execute: async ({ message }) => {
    try {
      const stations = await azuraClient.Stations.getAll();

      const embed = new EmbedBuilder()
        .setTitle("Station List")
        .setDescription(`Found ${stations.length} station(s).`)
        .setColor("#000000")
        .addFields(
          stations.map((station): APIEmbedField => {
            return {
              name: station.name,
              value: station.description || "No description provided.",
              inline: false,
            };
          })
        );

      message.reply({
        embeds: [embed],
      });
    } catch (error: unknown) {
      console.error(error);
      const msg = HandleAxiosError(error);
      message.reply(msg);
    }
  },
});
