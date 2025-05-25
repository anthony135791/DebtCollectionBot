const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Send a ticket panel with button'),

  async execute(interaction, footer) {
    const embed = new EmbedBuilder()
      .setTitle('🎫 Need Help With a Debt?')
      .setDescription('Click the button below to create a private ticket.')
      .setColor('DarkGreen')
      .setFooter({ text: footer });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('📩 Open Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
