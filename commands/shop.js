import { readJSON } from "../json.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ApplicationCommandOptionType } from "discord.js";
import { UserData } from "../classes/data.js";
import Locale from "../classes/locale.js";

function BaseEmbed(type, num, locale, points) {
    return new EmbedBuilder()
        .setTitle(`${Locale.text(locale, "SHOP_TITLE")} (${type} #${num})`)
        .setDescription(Locale.text(locale, "SHOP_DESC", points))
        .setColor('#33AA33')
        .setTimestamp()
};

function BaseSelect(locale) {
    return new SelectMenuBuilder()
        .setCustomId('purchase')
        .setPlaceholder(Locale.text(locale, "SHOP_PURCHASE_SELECT"));
};

async function purchase(int, rewards, locale) {
    let data = await UserData.get(int.user.id);

    const reward = rewards[int.values[0]];
    if(data.hasReward(reward)) return await int.reply({content: Locale.text(locale, "SHOP_ITEM_OWNED"), ephemeral: true});
    if(data.points < reward.price) return await int.reply({content: Locale.text(locale, "SHOP_USER_BROKE"), ephemeral: true});
    data.addReward(reward);
    data.points -= reward.price;
    await UserData.set(int.user.id, data);
    if(reward.type == 'roles') await int.member.roles.add(reward.id, 'Delivering purchase reward.');
    return await int.reply({content: Locale.text(locale, "SHOP_TRANSACTION", reward.name), ephemeral: true});
};

export const data = {
    name: 'shop',
    aliases: ['mart'],
    desc: 'This is a command for displaying the shop.',
    usage: '/shop',
    options: [
        {
            "name": "filter",
            "description": "The text filter to apply to the shop.",
            "type": ApplicationCommandOptionType.String,
            "required": false
        }
    ],
    execute: async ({interaction, userdata}) => {
        const member = interaction.member;
        let rewards = await readJSON('json/rewards.json');

        const menuRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('backgrounds')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_BACKGROUNDS"))
                .setStyle('PRIMARY'),
            new ButtonBuilder()
                .setCustomId('frames')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_FRAMES"))
                .setStyle('PRIMARY'),
            new ButtonBuilder()
                .setCustomId('roles')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_ROLES"))
                .setStyle('PRIMARY')
        );

        const categoryRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_BACK"))
                .setStyle('SECONDARY'),
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_PREVIOUS"))
                .setStyle('PRIMARY'),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_NEXT"))
                .setStyle('PRIMARY')
        );

        const purchaseRow = new ActionRowBuilder();

        const menuEmbed = new EmbedBuilder()
            .setColor('#33AA33')
            .setTitle(`${Locale.text(userdata.settings.locale, "SHOP_TITLE")} (${member.user.tag}):`)
            .setDescription(Locale.text(userdata.settings.locale, "SHOP_DESC", userdata.points))
        
        let shop = {
            current: 'menu',
            backgrounds: {
                pageNum: 1,
                count: 0,
                embeds: [BaseEmbed(Locale.text(userdata.settings.locale, "BUTTON_BACKGROUNDS"), '1', userdata.settings.locale, userdata.points)],
                selects: [BaseSelect(userdata.settings.locale)]
            },
            frames: {
                pageNum: 1,
                count: 0,
                embeds: [BaseEmbed(Locale.text(userdata.settings.locale, "BUTTON_FRAMES"), '1', userdata.settings.locale, userdata.points)],
                selects: [BaseSelect(userdata.settings.locale)]
            },
            roles: {
                pageNum: 1,
                count: 0,
                embeds: [BaseEmbed(Locale.text(userdata.settings.locale, "BUTTON_ROLES"), '1', userdata.settings.locale, userdata.points)],
                selects: [BaseSelect(userdata.settings.locale)]
            }
        };

        // Build pages:
        for(const i in rewards){
            const reward = rewards[i];
            if(!reward.shown) continue;
            if(reward.endTime && reward.endTime < Date.now()) continue;
            if(reward.startTime && reward.startTime > Date.now()) continue;

            if(shop[reward.type].count > 14){
                shop[reward.type].count = 0;
                shop[reward.type].embeds.push(BaseEmbed(reward.type[0].toUpperCase() + reward.type.substring(1), shop[reward.type].embeds.length + 1, userdata.settings.locale, userdata.points));
                shop[reward.type].selects.push(BaseSelect(userdata.settings.locale));
            };
            
            shop[reward.type].count += 1;
            shop[reward.type].embeds[shop[reward.type].embeds.length - 1]
                .setDescription(shop[reward.type].embeds[shop[reward.type].embeds.length - 1].data.description + `\n• ${reward.name} (${reward.price} points)`)
            shop[reward.type].selects[shop[reward.type].selects.length - 1]
                .addOptions([{label: reward.name, value: reward.id}]);
        };
        
        const msg = await interaction.reply({embeds: [menuEmbed], components: [menuRow], fetchReply: true});

        const collector = msg.createMessageComponentCollector({filter: int => int.user.id == member.user.id, idle: 30000});
        collector.on('collect', async int => {
            if(int.customId == 'backgrounds') {
                shop.current = 'backgrounds';
                await int.update({embeds: [shop[shop.current].embeds[shop[shop.current].pageNum - 1]], components: [purchaseRow.setComponents(shop[shop.current].selects[shop[shop.current].pageNum - 1]), categoryRow]})
            };

            if(int.customId == 'frames') {
                shop.current = 'frames';
                await int.update({embeds: [shop[shop.current].embeds[shop[shop.current].pageNum - 1]], components: [purchaseRow.setComponents(shop[shop.current].selects[shop[shop.current].pageNum - 1]), categoryRow]})
            };

            if(int.customId == 'roles') {
                shop.current = 'roles';
                await int.update({embeds: [shop[shop.current].embeds[shop[shop.current].pageNum - 1]], components: [purchaseRow.setComponents(shop[shop.current].selects[shop[shop.current].pageNum - 1]), categoryRow]})
            };

            if(int.customId == 'back') {
                shop.current = 'menu';
                await int.update({embeds: [menuEmbed], components: [menuRow]});
            };

            if(int.customId == 'previous') {
                shop[shop.current].pageNum -= 1;
                if(shop[shop.current].pageNum < 1) shop[shop.current].pageNum = shop[shop.current].embeds.length;
                await int.update({embeds: [shop[shop.current].embeds[shop[shop.current].pageNum - 1]], components: [purchaseRow.setComponents(shop[shop.current].selects[shop[shop.current].pageNum - 1]), categoryRow]});
            };

            if(int.customId == 'next'){
                shop[shop.current].pageNum += 1;
                if(shop[shop.current].pageNum > shop[shop.current].embeds.length) shop[shop.current].pageNum = 1;
                await int.update({embeds: [shop[shop.current].embeds[shop[shop.current].pageNum - 1]], components: [purchaseRow.setComponents(shop[shop.current].selects[shop[shop.current].pageNum - 1]), categoryRow]});
            };

            if(int.customId == 'purchase') {
                await purchase(int, rewards, userdata.settings.locale);
            };
        });
        collector.on('end', async () => {
            if(msg.editable) await msg.edit({embeds: [new EmbedBuilder().setDescription(Locale.text(userdata.settings.locale, "EXPIRED"))], components: []});
        });
    }
};