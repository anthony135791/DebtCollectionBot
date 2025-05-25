const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setPaymentPlan, findDebtById } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-paymentplan')
    .setDescription('Set a payment plan for a debt ID')
    .addStringOption(opt => opt.setName('debtid').setDescription('Debt ID').setRequired(true))
    .addNumberOption(opt => opt.setName('amount').setDescription('Payment amount').setRequired(true))
    .addStringOption(opt =>
      opt.setName('frequency')
        .setDescription('Payment frequency')
        .setRequired(true)
        .addChoices(
          { name: 'daily', value: 'daily' },
          { name: 'weekly', value: 'weekly' }
        )
    ),

  async execute(interaction, footer) {
    const debtId = interaction.options.getString('debtid');
    const amount = interaction.options.getNumber('amount');
    const frequency = interaction.options.getString('frequency');

    const entry = findDebtById(debtId);
    if (!entry) {
      return await interaction.reply({ content: 'Debt ID not found.', ephemeral: true });
    }

    const nextDue = new Date();
    if (frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);

    const plan = { amount, frequency, nextDue: nextDue.toISOString() };
    setPaymentPlan(entry.username, debtId, plan);

    const embed = new EmbedBuilder()
      .setTitle('🧾 Payment Plan Created')
      .setDescription(`Plan set for debt **${debtId}**: $${amount}/${frequency}`)
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
