const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dm')
		.setDescription('Info about DM me'),
	async execute(interaction) {
		await interaction.reply('Manda um DM com imagem para adicionar na pasta de imagens do caramelo (videos no futuro).');
	},
};