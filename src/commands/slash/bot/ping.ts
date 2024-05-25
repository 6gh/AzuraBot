import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/command/slash.js";

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get the bot's ping"),
  ({ interaction }) => {
    interaction.reply(`Pong! ${interaction.client.ws.ping}ms`);
  }
);
