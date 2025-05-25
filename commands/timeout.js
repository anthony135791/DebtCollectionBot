const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a user for a duration')
    .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, footer) {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      const durationMs = minutes * 60 * 1000;
      await member.timeout(durationMs, reason);

      const embed = new EmbedBuilder()
        .setTitle('⏱️ User Timed Out')
        .setDescription(`${user.tag} is muted for ${minutes} minute(s).\nReason: ${reason}`)
        .setColor('Yellow')
        .setFooter({ text: footer });

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: `❌ Failed to timeout ${user.tag}`, ephemeral: true });
    }
  }
};
