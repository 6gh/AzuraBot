import { REST, Routes } from "discord.js";
import { TextCommand } from "../../../classes/command/text.js";
import { Vars } from "../../../index.js";

export default new TextCommand({
  name: "reload",
  execute: async ({ message, args, bot }) => {
    if (!message.guild) {
      message.reply("This command can only be used in servers");
      return;
    }

    const channel = message.channel;
    const guild = message.guild;

    let commands = [];

    for (const [_, command] of bot.commands.slash) {
      commands.push(command.meta.toJSON());
    }

    const rest = new REST().setToken(bot.token || Vars.BOT_TOKEN);

    try {
      console.log(
        `Started refreshing application (/) commands for ${guild.name}`
      );

      if (!bot.application?.id) {
        throw new Error("Bot has no application id");
      }

      const data = await rest.put(
        Routes.applicationGuildCommands(bot.application?.id, guild.id),
        { body: commands }
      );

      console.log(data);
      console.log(
        `Successfully reloaded application (/) commands for ${guild.name}`
      );
      channel.send("Successfully reloaded application (/) commands");
    } catch (error) {
      console.error(error);
      console.error(
        `Failed to reload application (/) commands for ${guild.name}`
      );
      channel.send("Failed to reload application (/) commands");
    }
  },
});
