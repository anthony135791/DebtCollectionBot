const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findDebtById, loadDebts, saveDebts } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-discord')
    .setDescription('Link a Discord user to a debt ID')
    .addStringOption(opt => opt.setName('debtid').setDescription('Debt ID').setRequired(true))
    .addUserOption(opt => opt.setName('user').setDescription('User to link').setRequired(true)),

  async execute(interaction, footer) {
    const debtId = interaction.options.getString('debtid');
    const user = interaction.options.getUser('user');
    const entry = findDebtById(debtId);
    if (!entry) return interaction.reply({ content: 'Debt ID not found.', ephemeral: true });

    const debts = loadDebts();
    const record = debts[entry.username.toLowerCase()].find(d => d.id === debtId);
    if (!record) return interaction.reply({ content: 'Debt not found.', ephemeral: true });

    record.userId = user.id;
    saveDebts(debts);

    const embed = new EmbedBuilder()
      .setTitle('🔗 Discord User Linked')
      .setDescription(`User ${user.tag} has been linked to debt **${debtId}**.`)
      .setFooter({ text: footer });

    try {
      await user.send(`📌 You have been linked to debt ID **${debtId}**. You may now receive payment updates.`);
    } catch {}

    await interaction.reply({ embeds: [embed] });
  }
};
