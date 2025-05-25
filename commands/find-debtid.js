const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserDebts } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('find-debtid')
    .setDescription('Find all debt IDs for a username')
    .addStringOption(opt => opt.setName('username').setDescription('Debtor username').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Filter by reason (optional)').setRequired(false)),

  async execute(interaction, footer) {
    const username = interaction.options.getString('username');
    const filterReason = interaction.options.getString('reason');
    const debts = getUserDebts(username);

    const filtered = filterReason
      ? debts.filter(d => d.reason.toLowerCase().includes(filterReason.toLowerCase()))
      : debts;

    const embed = new EmbedBuilder()
      .setTitle(`🆔 Debt IDs for ${username}`)
      .setDescription(filtered.length
        ? filtered.map(d => `**${d.id}** — $${d.amount} for "${d.reason}"`).join('\n')
        : 'No debts found.')
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
