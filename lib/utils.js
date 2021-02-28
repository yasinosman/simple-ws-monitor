const chalk = require("chalk");

/**
 *  Log message to console
 * @param {String} msg
 * @param {"error" | "warning" | "success" | "info"} type
 */
const log = (msg, type = "warning") => {
    const getTime = () => {
        const d = new Date();

        return `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${(
            "0" + d.getSeconds()
        ).slice(-2)}`;
    };

    let color = "yellow";
    switch (type) {
        case "error": {
            color = "red";
            break;
        }
        case "success": {
            color = "green";
            break;
        }
        case "info": {
            color = "cyan";
            break;
        }
        default:
            break;
    }

    console.log(` > ${chalk[color](msg)} (${chalk.blue(getTime())})`);
};

module.exports = {
    log,
};
