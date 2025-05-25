const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to a channel')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send the announcement to')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Title of the announcement')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Message content')
        .setRequired(true))
    .addBooleanOption(opt =>
      opt.setName('ping')
        .setDescription('Ping @everyone?')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, footer) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const ping = interaction.options.getBoolean('ping') || false;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor('Blue')
      .setFooter({ text: footer });

    try {
      await channel.send({
        content: ping ? '@everyone' : null,
        embeds: [embed]
      });

      await interaction.reply({ content: '📢 Announcement sent successfully.', ephemeral: true });
    } catch (err) {
      console.error('❌ Failed to send announcement:', err);
      await interaction.reply({ content: '❌ Failed to send announcement.', ephemeral: true });
    }
  }
};
