const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const dotenv = require('dotenv');
const config = require('./config');
const templates = require('./template');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const token = process.env.BOT_TOKEN;
const prefix = '>';

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== config.channel_id) return;

    const roleIds = config.permission_roles;
    const hasPermission = (config.allow_admin && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) || 
                          message.member.roles.cache.some(role => roleIds.includes(role.id));

    if (!hasPermission) return;

    if (message.content.toLowerCase() === `${prefix}ssu`) {
        await handleCommand(message, templates.ssu, true);
    }

    if (message.content.toLowerCase() === `${prefix}ssd`) {
        await handleCommand(message, templates.ssd, true);
    }
});

async function handleCommand(message, template, deletePrevious) {
    await message.delete();

    if (deletePrevious) {
        const messages = await message.channel.messages.fetch({ limit: 100 });
        for (const [id, msg] of messages) {
            if (msg.id !== message.id && msg.id !== config.protected_message_id) {
                try {
                    await msg.delete();
                } catch (error) {
                    console.error('Failed to delete a previous message:', error);
                }
            }
        }
    }

    await message.channel.send(template.text);
}

client.login(token);