import { Client, ClientEvents } from "discord.js";
import path from "path";
import { readdirSync } from "fs";
import { TextCommand } from "./command/text.js";
import { BotEvent } from "./event.js";
import { SlashCommand } from "./command/slash.js";
import { Log } from "./log.js";

export class AzuraBot extends Client {
  public commands = {
    text: new Map<string, TextCommand>(),
    slash: new Map<string, SlashCommand>(),
  };

  constructor() {
    super({
      intents: [
        "Guilds",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent",
      ],
    });
  }

  public async initCommands(): Promise<void> {
    // we need import.meta.dirname to get the current directory
    // this is used to load the commands from the commands directory
    // unfortunately, this is only available in node v20.11.0 and up
    // so we error out if it's not available
    if (import.meta.dirname === undefined) {
      throw new Error(
        "import.meta.dirname is not available. Are you using node v20.11.0 or up?"
      );
    }

    const commandsDir = path.resolve(
      path.join(import.meta.dirname, "..", "commands")
    );

    Log.info(`Looking for commands in ${commandsDir}`);

    const textCommandFiles = readdirSync(path.join(commandsDir, "text"), {
      recursive: true,
      withFileTypes: true,
    }).filter((x) => x.isFile() && x.name.endsWith(".js"));

    for (const file of textCommandFiles) {
      const command = (await import(path.join(file.parentPath, file.name)))
        .default as TextCommand | undefined;

      if (!command) {
        console.warn(
          `[WARN] Command ${file.name} does not have a default export`
        );
        continue;
      }

      if (!command.name || !command.execute) {
        console.warn(
          `[WARN] Command ${file.name} does not have a name or execute function`
        );
        continue;
      }

      this.commands.text.set(command.name, command);
    }

    Log.info(
      `Loaded ${this.commands.text.size} text commands from ${textCommandFiles.length} files`
    );

    const slashCommandFiles = readdirSync(path.join(commandsDir, "slash"), {
      recursive: true,
      withFileTypes: true,
    }).filter((x) => x.isFile() && x.name.endsWith(".js"));

    for (const file of slashCommandFiles) {
      const command = (await import(path.join(file.parentPath, file.name)))
        .default as SlashCommand | undefined;

      if (!command) {
        console.warn(
          `[WARN] Command ${file.name} does not have a default export`
        );
        continue;
      }

      if (!command.meta.name || !command.execute) {
        console.warn(
          `[WARN] Command ${file.name} does not have a name or execute function`
        );
        continue;
      }

      this.commands.slash.set(command.meta.name, command);
    }

    Log.info(
      `Loaded ${this.commands.slash.size} text commands from ${slashCommandFiles.length} files`
    );

    const eventsDir = path.resolve(
      path.join(import.meta.dirname, "..", "events")
    );

    Log.info(`Looking for events in ${eventsDir}`);

    const eventFiles = readdirSync(eventsDir, {
      recursive: true,
      withFileTypes: true,
    }).filter((x) => x.isFile() && x.name.endsWith(".js"));
    let eventCount = 0;

    for (const file of eventFiles) {
      const event = (await import(path.join(file.parentPath, file.name)))
        .default as BotEvent<keyof ClientEvents> | undefined;

      if (!event) {
        console.warn(
          `[WARN] Event ${file.name} does not have a default export`
        );
        continue;
      }

      if (!event.event || !event.execute) {
        console.warn(
          `[WARN] Event ${file.name} does not have an event or execute function`
        );
        continue;
      }

      this.on(event.event, event.execute);
      eventCount++;
    }

    Log.info(`Loaded ${eventCount} events from ${eventFiles.length} files`);
  }

  public start(token: string): void {
    this.login(token);
  }

  public stop(): void {
    this.destroy();
  }
}

export default AzuraBot;
