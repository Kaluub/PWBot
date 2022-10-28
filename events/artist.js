import Color from "ts-color-class";

export const data = {
    id: 'artist',
    cronTime: '0 * * * *',
    async execute({client}) {
        const guild = client.guilds.cache.get("399918427256520705");
        const role = await guild.roles.fetch("1030932283227643984");
        let color = new Color(role.hexColor);
        color = color.shiftHue(0.01);
        await role.setColor(color.getHex());
    }
};