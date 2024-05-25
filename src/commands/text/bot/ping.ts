import { TextCommand } from "../../../classes/command/text.js";

export default new TextCommand({
  name: "ping",
  execute: ({ message }) => {
    message.channel.send("Pong!");
  },
});
