const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const {
  generateId,
  addDebt,
  getUserDebts
} = require('../utils/storage');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-debt')
    .setDescription('Add a new debt and create a debt case channel')
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('Name of the debtor')
        .setRequired(true))
    .addNumberOption(opt =>
      opt.setName('amount')
        .setDescription('Amount owed')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Why does this user owe debt?')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Optional Discord user to notify')),

  async execute(interaction, footer) {
    const username = interaction.options.getString('username');
    const amount = interaction.options.getNumber('amount');
    const reason = interaction.options.getString('reason');
    const user = interaction.options.getUser('user');

    // Step 1: Generate a new debt ID
    const debtId = generateId();

    // Step 2: Create the debt case channel
    const caseChannel = await interaction.guild.channels.create({
      name: `debt-${username.toLowerCase()}-${debtId}`,
      type: 0, // text channel
      parent: config.debtCaseCategoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        ...(user ? [{ id: user.id, allow: ['ViewChannel', 'SendMessages'] }] : []),
        ...config.supportRoles.map(rid => ({
          id: rid,
          allow: ['ViewChannel', 'SendMessages']
        }))
      ]
    });

    // Step 3: Save the debt with channel ID
    addDebt(username, amount, reason, user?.id, caseChannel.id);

    // Step 4: Fetch latest debt entry for display
    const latest = getUserDebts(username).at(-1);

    // Step 5: DM the user if provided
    if (user) {
      const embed = new EmbedBuilder()
        .setTitle('💼 You Have a New Debt')
        .addFields(
          { name: 'Amount', value: `$${amount}`, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Debt ID', value: latest.id, inline: false },
          { name: 'Action Required', value: 'Please open a ticket in the server to resolve this debt.', inline: false }
        )
        .setColor('Red')
        .setFooter({ text: footer });

      try {
        await user.send({ embeds: [embed] });
      } catch {
        console.warn(`❌ Could not DM ${user.tag}`);
      }
    }

    // Step 6: Reply to command issuer
    const confirmEmbed = new EmbedBuilder()
      .setTitle('💸 Debt Added')
      .addFields(
        { name: 'User', value: username, inline: true },
        { name: 'Amount', value: `$${amount}`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Debt ID', value: latest.id, inline: false },
        { name: 'Channel', value: `<#${caseChannel.id}>`, inline: false }
      )
      .setFooter({ text: footer });

    await interaction.reply({ embeds: [confirmEmbed] });

    // Step 7: Send intro message in debt case channel
    await caseChannel.send({
      content: user ? `<@${user.id}>` : null,
      embeds: [
        new EmbedBuilder()
          .setTitle('🧾 Debt Case Opened')
          .setDescription(`Tracking debt **${latest.id}** for **${username}** ($${amount})`)
          .setColor(0x3366cc)
          .setFooter({ text: footer })
      ]
    });
  }
};
