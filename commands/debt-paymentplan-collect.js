const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const { collectPayment, findDebtById } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debt-paymentplan-collect')
    .setDescription('Collect a payment from a debt by ID')
    .addStringOption(opt =>
      opt.setName('debtid')
        .setDescription('Debt ID')
        .setRequired(true))
    .addNumberOption(opt =>
      opt.setName('amount')
        .setDescription('Amount to collect')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Optional user to DM confirmation')),

  async execute(interaction, footer) {
    const debtId = interaction.options.getString('debtid');
    const amount = interaction.options.getNumber('amount');
    const notifyUser = interaction.options.getUser('user');

    const entry = findDebtById(debtId);
    if (!entry) {
      return await interaction.reply({
        content: '❌ Debt ID not found.',
        ephemeral: true
      });
    }

    const success = await collectPayment(entry.username, debtId, amount, interaction.client);

    const embed = new EmbedBuilder()
      .setTitle(success ? '💰 Payment Collected' : '⚠️ Collection Failed')
      .setDescription(success
        ? `Collected $${amount} from debt **${debtId}**.`
        : `Could not collect from debt ${debtId}.`)
      .setColor(success ? 'Green' : 'Red')
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });

    // DM the user if provided
    if (notifyUser && success) {
      try {
        const dm = new EmbedBuilder()
          .setTitle('✅ Payment Confirmation')
          .setDescription(`Your $${amount} payment toward debt **${debtId}** has been received.`)
          .setColor('Blue')
          .setFooter({ text: footer });

        await notifyUser.send({ embeds: [dm] });
      } catch {
        console.warn(`❌ Could not DM ${notifyUser.tag}`);
      }
    }
  }
};
