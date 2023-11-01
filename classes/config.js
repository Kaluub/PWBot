import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    static TOKEN = Config.required(process.env.TOKEN, "TOKEN");

    static ADMINS = Config.parseList(process.env.ADMINS, [
        "186459664974741504", // Aldople
        "461564949768962048", // Kaluub
        "264660321770274837", // Maeve
        "740098549470986310", // Exil
        "1102767840999772180", // PIXELLOX
        "566235326100799490", // lokalapsi
    ]);

    static HOME_SERVERS = Config.parseList(process.env.HOME_SERVERS, [
        "399918427256520705", // Pixel Worlds Game
        "807309287797686343", // Kaluub's testing server
    ]);

    static APPEAL_CHANNEL = process.env.APPEAL_CHANNEL ?? "1018608993066815549";
    static LOG_CHANNEL = process.env.LOG_CHANNEL ?? "657524105632940063"; // #server-logs

    static POSTGRES_HOST = process.env.POSTGRES_HOST ?? "localhost";
    static POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT) || 5432;
    static POSTGRES_USER = process.env.POSTGRES_USER ?? "postgres";
    static POSTGRES_PASSWORD = Config.required(process.env.POSTGRES_PASSWORD, "POSTGRES_PASSWORD");
    static POSTGRES_DATABASE = process.env.POSTGRES_DATABASE ?? "pwbot";

    static required(arg, name) {
        if (!arg)
            throw `Required .env value not passed! Please set ${name}.`;
        return arg;
    }

    /**
     * Parse an environment variable to a boolean.
     * @param {string} arg The environment variable.
     * @param {boolean} def The default value.
     */
    static parseBoolean(arg, def = false) {
        return arg?.toUpperCase() === "TRUE" ?? def;
    }

    /**
     * Parse an environment variable to a list.
     * @param {string} arg The environment variable.
     * @param {string[]} def The default value.
     */
    static parseList(arg, def = []) {
        return arg?.split(",") ?? def;
    }
}

export default Config;
