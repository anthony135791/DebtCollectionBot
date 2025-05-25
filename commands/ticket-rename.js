const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-rename')
    .setDescription('Rename your current ticket')
    .addStringOption(opt =>
      opt.setName('newname')
        .setDescription('New name (only suffix, will become ticket-newname)')
        .setRequired(true)
    ),

  async execute(interaction, footer) {
    const channel = interaction.channel;
    if (!channel.name.startsWith('ticket-')) {
      return await interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
    }

    const newSuffix = interaction.options.getString('newname').toLowerCase().replace(/\s+/g, '-');
    const newName = `ticket-${newSuffix}`;

    try {
      await channel.setName(newName);
      await interaction.reply({ content: `✅ Channel renamed to ${newName}.`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Could not rename channel.', ephemeral: true });
    }
  }
};
