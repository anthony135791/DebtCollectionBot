const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  Events
} = require('discord.js');
const config = require('./config.json');
const { runReminders } = require('./utils/scheduler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const FOOTER = 'This communication is from a debt collector. This is an attempt to collect a debt. Any information obtained will be used for that purpose.';

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = commandFiles.map(file => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  return command.data.toJSON();
});

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.token);
(async () => {
  try {
    console.log('📦 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('✅ Commands registered.');
  } catch (err) {
    console.error('❌ Command registration error:', err);
  }
})();

// On ready
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setStatus(config.status || 'online');
  client.user.setActivity(config.activity || 'Collecting debts', { type: 0 });

  // Start hourly reminder check
  setInterval(() => runReminders(client), 60 * 60 * 1000);
});

// On interaction (buttons + slash)
client.on(Events.InteractionCreate, async interaction => {
  // Ticket Button
  if (interaction.isButton() && interaction.customId === 'create_ticket') {
    const existing = interaction.guild.channels.cache.find(c =>
      c.name === `ticket-${interaction.user.username.toLowerCase()}`
    );
    if (existing) {
      return interaction.reply({
        content: '❗ You already have a ticket open.',
        ephemeral: true
      });
    }

    const supportPerms = config.supportRoles.map(role => ({
      id: role,
      allow: ['ViewChannel', 'SendMessages']
    }));

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username.toLowerCase()}`,
      type: 0, // GuildText
      parent: config.ticketCategoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
        ...supportPerms
      ]
    });

    await ticketChannel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [
        {
          title: '🎟️ Ticket Created',
          description: `Welcome ${interaction.user}, please describe your issue.`,
          color: 0x0099ff,
          footer: { text: FOOTER }
        }
      ]
    });

    return interaction.reply({
      content: `✅ Ticket created: ${ticketChannel}`,
      ephemeral: true
    });
  }

  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction, FOOTER);
      } catch (err) {
        console.error(`❌ Error in ${interaction.commandName}:`, err);
        await interaction.reply({
          content: '⚠️ There was an error executing that command.',
          ephemeral: true
        });
      }
    }
  }
});

// ✅ Log in the bot
client.login(config.token);
