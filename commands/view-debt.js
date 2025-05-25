const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserDebts } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-debt')
    .setDescription('View debt history of a username')
    .addStringOption(opt => opt.setName('username').setDescription('Username').setRequired(true)),

  async execute(interaction, footer) {
    const username = interaction.options.getString('username');
    const debts = getUserDebts(username);

    const embed = new EmbedBuilder()
      .setTitle(`📄 Debts for ${username}`)
      .setDescription(debts.length ? debts.map(d => `• **[${d.id}]** $${d.amount} - ${d.reason}`).join('\n') : 'No debts found.')
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
