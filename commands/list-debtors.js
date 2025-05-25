const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllDebtors } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-debtors')
    .setDescription('List all users with active debt'),

  async execute(interaction, footer) {
    const names = getAllDebtors();
    const embed = new EmbedBuilder()
      .setTitle('📋 Active Debtors')
      .setDescription(names.length ? names.join('\n') : 'No debtors.')
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
