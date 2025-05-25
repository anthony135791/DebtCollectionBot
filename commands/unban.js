const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by ID')
    .addStringOption(opt => opt.setName('userid').setDescription('User ID to unban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, footer) {
    const userId = interaction.options.getString('userid');

    try {
      await interaction.guild.bans.remove(userId);
      const embed = new EmbedBuilder()
        .setTitle('🛡️ User Unbanned')
        .setDescription(`User ID \`${userId}\` has been unbanned.`)
        .setColor('Green')
        .setFooter({ text: footer });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: '❌ Failed to unban user.', ephemeral: true });
    }
  }
};
