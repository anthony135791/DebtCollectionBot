const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findDebtById } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debt-info')
    .setDescription('View full information about a debt')
    .addStringOption(opt => opt.setName('debtid').setDescription('Debt ID').setRequired(true)),

  async execute(interaction, footer) {
    const debtId = interaction.options.getString('debtid');
    const entry = findDebtById(debtId);

    if (!entry) {
      return await interaction.reply({ content: 'Debt ID not found.', ephemeral: true });
    }

    const { debt, username } = entry;
    const embed = new EmbedBuilder()
      .setTitle(`🔎 Debt Info: ${debtId}`)
      .addFields(
        { name: 'Debtor', value: username, inline: true },
        { name: 'Amount', value: `$${debt.amount}`, inline: true },
        { name: 'Reason', value: debt.reason, inline: false },
        { name: 'Date Issued', value: new Date(debt.timestamp).toLocaleString(), inline: false },
        ...(debt.paymentPlan ? [
          { name: 'Payment Plan', value: `$${debt.paymentPlan.amount} / ${debt.paymentPlan.frequency}`, inline: true },
          { name: 'Next Due', value: new Date(debt.paymentPlan.nextDue).toLocaleString(), inline: true }
        ] : [])
      )
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
