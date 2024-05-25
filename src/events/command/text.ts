import { BotEvent } from "../../classes/event.js";
import { Log } from "../../classes/log.js";
import { Bot, Vars } from "../../index.js";

export default new BotEvent("messageCreate", (message) => {
  if (message.author.bot) {
    return;
  }

  if (!message.content.startsWith(Vars.BOT_PREFIX)) {
    return;
  }

  const args = message.content.slice(Vars.BOT_PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) {
    return;
  }

  const cmd = Bot.commands.text.get(command);

  if (!cmd) {
    return;
  }

  try {
    cmd.execute({
      message,
      args,
      bot: message.client as typeof Bot,
    });
  } catch (error: unknown | Error) {
    if (error instanceof Error) {
      Log.error(`Error executing command ${command}: ${error.message}`);
    } else {
      Log.error(`Error executing command ${command}: ${error}`);
    }
    message.reply(
      ":skull: There was an error trying to execute that command! Please try again later."
    );
  }
});
