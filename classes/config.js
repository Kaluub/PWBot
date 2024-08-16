import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    constructor() {
        this.token = this.required(process.env.TOKEN, "TOKEN");

        this.admins = this.parseList(process.env.ADMINS, [
            "186459664974741504", // Aldople
            "461564949768962048", // Kaluub
            "740098549470986310", // Exil
            "264660321770274837", // Meave
            "566235326100799490", // lokalapsi
        ]);

        this.home_servers = this.parseList(process.env.HOME_SERVERS, [
            "399918427256520705", // Pixel Worlds Game
            "807309287797686343", // Kaluub's testing server
        ]);

        this.appeal_channel = process.env.APPEAL_CHANNEL ?? "1018608993066815549"; // #appeals
        this.log_channel = process.env.LOG_CHANNEL ?? "657524105632940063"; // #server-logs
        this.action_logs_channel = process.env.ACTION_LOGS_CHANNEL ?? "400318674214584330"; // #action-logs

        this.postgres_host = process.env.POSTGRES_HOST ?? "localhost";
        this.postgres_port = parseInt(process.env.POSTGRES_PORT) || 5432;
        this.postgres_user = process.env.POSTGRES_USER ?? "postgres";
        this.postgres_password = this.required(process.env.POSTGRES_PASSWORD, "POSTGRES_PASSWORD");
        this.postgres_database = process.env.POSTGRES_DATABASE ?? "pwbot";
    }

    required(arg, name) {
        if (!arg) {
            throw `Required .env value not passed! Please set ${name}.`;
        }
        return arg;
    }

    /**
     * Parse an environment variable to a boolean.
     * @param {string} arg The environment variable.
     * @param {boolean} def The default value.
     * @returns {boolean}
     */
    parseBoolean(arg, def = false) {
        return arg?.toUpperCase() === "TRUE" ?? def;
    }

    /**
     * Parse an environment variable to a list.
     * @param {string} arg The environment variable.
     * @param {string[]} def The default value.
     * @returns {string[]}
     */
    parseList(arg, def = []) {
        return arg?.split(",") ?? def;
    }
}

export default new Config();
