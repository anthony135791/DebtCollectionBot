const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { clearDebt } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-debt')
    .setDescription('Clear all debts for a user')
    .addStringOption(opt => opt.setName('username').setDescription('Username').setRequired(true)),

  async execute(interaction, footer) {
    const username = interaction.options.getString('username');
    clearDebt(username);

    const embed = new EmbedBuilder()
      .setTitle('✅ Debts Cleared')
      .setDescription(`All debts cleared for ${username}`)
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
};
