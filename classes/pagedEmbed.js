export default class PagedEmbed {
    constructor(embeds = [], page = 0) {
        this.embeds = embeds;
        this.page = page;
    };

    addEmbeds(...embeds) {
        this.embeds = this.embeds.concat(embeds);
    };

    addPage(change = 1) {
        this.page += change;
        if(this.page >= this.embeds.length) this.page = 0;
        if(this.page < 0) this.page = this.embeds.length - 1;
        return this.embeds[this.page];
    };

    getPage(page) {
        return this.embeds[page];
    };
};