const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client, footer) {
    if (interaction.isButton() && interaction.customId === 'create_ticket') {
      const existing = interaction.guild.channels.cache.find(c =>
        c.name === `ticket-${interaction.user.id}`
      );
      if (existing) return interaction.reply({ content: '❗ You already have an open ticket.', ephemeral: true });

      const supportPerms = config.supportRoles.map(role => ({
        id: role,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }));

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          ...supportPerms
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle('🎟️ Ticket Created')
        .setDescription(`Hello ${interaction.user}, a staff member will be with you shortly.`)
        .setColor('Blue')
        .setFooter({ text: footer });

      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
      await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction, footer);
    }
  }
};
