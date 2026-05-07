const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { toggleChannel } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle-reactions')
        .setDescription('Quick toggle auto reactions for this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addBooleanOption(option => option.setName('enabled').setDescription('Enable or disable auto reactions').setRequired(true)),
    
    async execute(interaction) {
        const enabled = interaction.options.getBoolean('enabled');
        await toggleChannel(interaction.channelId, enabled);
        await interaction.reply({ content: `Auto reactions are now **${enabled ? 'enabled' : 'disabled'}** for this channel.`, ephemeral: true });
    },
};
