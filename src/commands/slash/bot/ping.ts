import { SlashCommandBuilder } from "discord.js";

export default new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get the bot's ping");