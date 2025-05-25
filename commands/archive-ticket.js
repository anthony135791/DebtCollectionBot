const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { loadDebts } = require('../utils/storage');
const config = require('../config.json');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('archive-ticket')
    .setDescription('Archive and send this ticket to the logs'),

  async execute(interaction, footer) {
    const channel = interaction.channel;
    if (!channel.name.startsWith('ticket-')) {
      return await interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const html = `
      <html><body><h2>Ticket Transcript: ${channel.name}</h2><hr/>
      ${sorted.map(m =>
        `<p><strong>${m.author.tag}</strong> [${new Date(m.createdAt).toLocaleString()}]: ${m.cleanContent}</p>`
      ).join('\n')}
      <hr/></body></html>
    `;

    const fileName = path.join(__dirname, `../transcripts/${channel.name}.html`);
    fs.mkdirSync(path.dirname(fileName), { recursive: true });
    fs.writeFileSync(fileName, html);

    const attachment = new AttachmentBuilder(fileName);

    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) {
      return interaction.reply({ content: '❌ Log channel not found.', ephemeral: true });
    }

    await logChannel.send({
      content: `🗂️ Archived transcript for ${channel.name}`,
      files: [attachment]
    });

    await interaction.reply({ content: '📁 Ticket has been archived and sent to logs.', ephemeral: true });
  }
};
