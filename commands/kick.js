const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction, footer) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await member.kick(reason);
      const embed = new EmbedBuilder()
        .setTitle('👢 User Kicked')
        .setDescription(`${user.tag} was kicked.\nReason: ${reason}`)
        .setColor('Orange')
        .setFooter({ text: footer });

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: `❌ Could not kick ${user.tag}`, ephemeral: true });
    }
  }
};
