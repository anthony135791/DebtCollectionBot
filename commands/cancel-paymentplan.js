const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findDebtById, saveDebts, loadDebts } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancel-paymentplan')
    .setDescription('Cancel a payment plan on a debt')
    .addStringOption(opt => opt.setName('debtid').setDescription('Debt ID').setRequired(true)),

  async execute(interaction, footer) {
    const debtId = interaction.options.getString('debtid');
    const entry = findDebtById(debtId);

    if (!entry) {
      return await interaction.reply({ content: 'Debt ID not found.', ephemeral: true });
    }

    const { username, debt } = entry;
    const debts = loadDebts();
    const userDebts = debts[username.toLowerCase()];
    const index = userDebts.findIndex(d => d.id === debtId);

    if (index !== -1 && userDebts[index].paymentPlan) {
      delete userDebts[index].paymentPlan;
      saveDebts(debts);

      const embed = new EmbedBuilder()
        .setTitle('❌ Payment Plan Cancelled')
        .setDescription(`Payment plan removed from debt **${debtId}**.`)
        .setFooter({ text: footer });

      return await interaction.reply({ embeds: [embed] });
    }

    await interaction.reply({ content: 'No active payment plan found on that debt.', ephemeral: true });
  }
};
