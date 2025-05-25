const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { findDebtById } = require('../utils/storage');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assign-debtcollector')
    .setDescription('Assign a Discord user to a debt case channel')
    .addStringOption(opt =>
      opt.setName('debtid')
        .setDescription('Debt ID to assign')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to assign to the debt channel')
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
      return await interaction.reply({ content: '❌ Debt does not have an associated channelId.', ephemeral: true });
    }

    try {
      const channel = await interaction.guild.channels.fetch(debt.channelId);
      if (!channel) {
        return await interaction.reply({ content: '❌ Debt case channel not found in server.', ephemeral: true });
      }

      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true
      });

      const embed = new EmbedBuilder()
        .setTitle('👤 Debt Collector Assigned')
        .setDescription(`${user.tag} has been added to debt case <#${channel.id}>`)
        .setColor('Green')
        .setFooter({ text: footer });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ Failed to assign user to channel:', err);
      await interaction.reply({ content: '❌ Failed to assign user to the debt channel.', ephemeral: true });
    }
  }
};
