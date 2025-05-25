const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { findDebtById } = require('../utils/storage');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unassign-debtcollector')
    .setDescription('Remove a user from a debt case channel')
    .addStringOption(opt =>
      opt.setName('debtid')
        .setDescription('Debt ID to unassign from')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to remove from the channel')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, footer) {
    const debtId = interaction.options.getString('debtid');
    const user = interaction.options.getUser('user');

    const entry = findDebtById(debtId);
    if (!entry) {
      return await interaction.reply({ content: '❌ Debt ID not found.', ephemeral: true });
    }

    const { debt } = entry;

    if (!debt.channelId) {
      return await interaction.reply({ content: '❌ Debt does not have a channel linked.', ephemeral: true });
    }

    try {
      const channel = await interaction.guild.channels.fetch(debt.channelId);
      if (!channel) {
        return await interaction.reply({ content: '❌ Debt case channel not found.', ephemeral: true });
      }

      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: false,
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setTitle('👋 Debt Collector Unassigned')
        .setDescription(`${user.tag} has been removed from <#${channel.id}>`)
        .setColor('Red')
        .setFooter({ text: footer });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ Failed to unassign:', err);
      await interaction.reply({ content: '❌ Failed to unassign user from the channel.', ephemeral: true });
    }
  }
};
