const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const token = process.env.TOKEN;
const targetChannelId = process.env.TARGET_CHANNEL_ID;
const requiredRoleId = process.env.REQUIRED_ROLE_ID;
const prefix = '>';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log('Ready!');
  console.log(`Bot logged in as ${client.user.tag}`); // Helpful for debugging
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const member = message.member;
  if (!member) return; // Ignore if message is not from a guild member

  try { // Wrap in try...catch for better error handling
    const requiredRole = message.guild.roles.cache.get(requiredRoleId);
    if (!requiredRole) {
      console.error("Required role not found!");
      return message.reply("The required role was not found. Please contact an administrator.");
    }

    if (!member.roles.cache.has(requiredRoleId)) {
      return message.reply("You do not have permission to use this command.");
    }

    if (command === 'ssu') {
      const targetChannel = client.channels.cache.get(targetChannelId);
      if (!targetChannel) {
        console.error("Target channel not found!"); // Log the error
        return message.reply('Target channel not found!');
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('SSU Message')
        .setDescription('This is the SSU message.');

      try {
        const sentMessage = await targetChannel.send({ embeds: [embed] });
        lastSentMessageId = sentMessage.id;
        message.reply('Message sent!');
      } catch (error) {
        console.error("Error sending embed:", error); // Log the specific error
        message.reply('Error sending message.');
      }
    }

    if (command === 'ssd') {
      const targetChannel = client.channels.cache.get(targetChannelId);
      if (!targetChannel) {
        console.error("Target channel not found!");
        return message.reply('Target channel not found!');
      }

      if (lastSentMessageId) {
        try {
          const messageToDelete = await targetChannel.messages.fetch(lastSentMessageId);
          await messageToDelete.delete();

          const newEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('SSD Message')
            .setDescription('This is the SSD replacement message.');

          const newSentMessage = await targetChannel.send({ embeds: [newEmbed] });
          lastSentMessageId = newSentMessage.id;
          message.reply('Message replaced!');
        } catch (error) {
          console.error("Error deleting/sending message:", error);
          message.reply('Error deleting/sending message. Make sure the bot has the correct permissions.');
        }
      } else {
        message.reply('No message to delete. Use >ssu first.');
      }
    }


    if (message.content === '>test') { // Test command
      message.reply('Test command received!');
    }
  } catch (error) {
    console.error("Global error handler:", error); // Catch any unexpected errors
    message.reply("An error occurred. Please check the logs."); // User-friendly message
  }
});

client.login(token);
