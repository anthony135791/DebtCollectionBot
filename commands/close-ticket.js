const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close-ticket')
    .setDescription('Close the current ticket'),

  async execute(interaction, footer) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('ticket-')) {
      return await interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🛑 Ticket Closed')
      .setDescription(`Ticket will be deleted in 5 seconds.`)
      .setColor('Red')
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
    setTimeout(() => channel.delete().catch(() => {}), 5000);
  }
};
