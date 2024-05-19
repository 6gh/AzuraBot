import axios from "axios";
import { TextCommand } from "../../../classes/command/text.js";
import { Vars } from "../../../index.js";
import { HandleAxiosError } from "../../../utils/handleAxiosError.js";
import { APIEmbedField, EmbedBuilder } from "discord.js";

export default new TextCommand({
  name: "stationlist",
  execute: async ({ message }) => {
    try {
      const response = await axios.get(`${Vars.AZURACAST_API_URL}/stations`, {
        headers: {
          "X-API-Key": Vars.AZURACAST_API_KEY,
        },
      });

      console.log(response.data);

      const embed = new EmbedBuilder()
        .setTitle("Station List")
        .setDescription(`Found ${response.data.length} station(s).`)
        .setColor("#000000")
        .addFields(
          response.data.map((station: unknown): APIEmbedField => {
            return {
              name: station["name"],
              value: station["description"] || "No description provided.",
              inline: false,
            };
          })
        );

      message.reply({
        embeds: [embed],
      });
    } catch (error: unknown) {
      const msg = HandleAxiosError(error);
      message.reply(msg);
    }
  },
});
