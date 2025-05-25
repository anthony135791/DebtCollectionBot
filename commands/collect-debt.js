const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserDebts } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('collect-debt')
    .setDescription('Send a debt collection notice to a username')
    .addStringOption(opt => opt.setName('username').setDescription('Username').setRequired(true)),

  async execute(interaction, footer) {
    const username = interaction.options.getString('username');
    const debts = getUserDebts(username);
    const total = debts.reduce((sum, d) => sum + d.amount, 0);

    const embed = new EmbedBuilder()
      .setTitle('📢 Debt Collection Notice')
      .setDescription(debts.length
        ? `${username} currently owes **$${total}** across ${debts.length} debts.`
        : `${username} has no debts.`)
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
