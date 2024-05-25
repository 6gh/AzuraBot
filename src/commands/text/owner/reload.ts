import { REST, Routes } from "discord.js";
import { TextCommand } from "../../../classes/command/text.js";
import { Vars } from "../../../index.js";
import { Log } from "../../../classes/log.js";

export default new TextCommand({
  name: "reload",
  execute: async ({ message, bot }) => {
    if (!message.guild) {
      message.reply(":skull: This command can only be used in servers");
      return;
    }

    const channel = message.channel;
    const guild = message.guild;

    const commands = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, command] of bot.commands.slash) {
      commands.push(command.meta.toJSON());
    }

    const rest = new REST().setToken(bot.token || Vars.BOT_TOKEN);

    try {
      Log.info(`Started refreshing application (/) commands for ${guild.name}`);

      if (!bot.application?.id) {
        throw new Error("Bot has no application id");
      }

      const data = await rest.put(
        Routes.applicationGuildCommands(bot.application?.id, guild.id),
        { body: commands }
      );

      Log.debug(data);
      Log.info(
        `Successfully reloaded application (/) commands for ${guild.name}`
      );
      channel.send("Successfully reloaded application (/) commands");
    } catch (error) {
      Log.error(error);
      Log.error(`Failed to reload application (/) commands for ${guild.name}`);
      channel.send("Failed to reload application (/) commands");
    }
  },
});
