import { BotEvent } from "../../classes/event.js";
import { Bot } from "../../index.js";

export default new BotEvent("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = Bot.commands.slash.get(interaction.commandName);

  if (!cmd) return;

  try {
    cmd.execute({
      interaction,
      bot: interaction.client as typeof Bot,
    });
  } catch (error: unknown | Error) {
    if (error instanceof Error) {
      console.error(
        `Error executing command ${interaction.commandName}: ${error.message}`
      );
    } else {
      console.error(
        `Error executing command ${interaction.commandName}: ${error}`
      );
    }
    interaction.reply({
      content:
        ":skull: There was an error trying to execute that command! Please try again later.",
      ephemeral: true,
    });
  }
});
