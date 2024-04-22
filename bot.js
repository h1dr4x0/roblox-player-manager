const { Client, EmbedBuilder } = require("discord.js");
const client = new Client({
  intents: "3276799",
});
const token = "token";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  const prefix = "!";
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const [cmd_name, ...args] = message.content
    .trim()
    .substring(prefix.length)
    .split(" ");
  switch (cmd_name) {
    case "servers":
      const response = await fetch("https://your_url/servers");
      const servers = await response.json();
      let textContent = "";
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Servers List - Roblox Player Manager")
        .setTimestamp();
      if (Object.keys(servers).length === 0) {
        embed.setDescription("There are no servers currently running.");
      } else {
        for (const id of Object.keys(servers)) {
          const server = servers[id];
          embed.addFields({
            name: `Server ID: ${id}`,
            value: `Server Players: ${Object.keys(server.players).length}`,
            inline: true,
          });
        }
        embed.setDescription(
          "Here is the list of servers that are currently running.\n" +
            textContent
        );
      }
      message.channel.send({ embeds: [embed] });
      break;
    case "players":
      const server_id = args[0];
      if (!server_id) {
        return message.channel.send("Please provide a server ID.");
      }
      const response2 = await fetch(
        `https://your_url/servers/${server_id}/players`
      );
      const server = await response2.json();
      if (server.error) {
        return message.channel.send(server.error);
      }
      let players = "";

      for (const player of Object.keys(server.players)) {
        players += `${player}\n`;
      }
      const embed2 = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`Players in Server ${server_id}`)
        .setDescription(players)
        .setTimestamp();
      message.channel.send({ embeds: [embed2] });
      break;
    case "kick":
      const server_id2 = args[0];
      const username = args[1];
      if (!server_id2) {
        return message.channel.send("Please provide a server ID.");
      }
      if (!username) {
        return message.channel.send("Please provide a username.");
      }
      const reason = args.slice(2).join(" ") || "No reason provided.";
      const response3 = await fetch(
        `https://your_url/servers/${server_id2}/players/${username}/kick`,
        {
          method: "GET",
        }
      );
      const json = await response3.json();
      if (json.error) {
        return message.channel.send(json.error);
      }
      message.channel.send(json.message);
      break;
  }
});

client.login(token);
