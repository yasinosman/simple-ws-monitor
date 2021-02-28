const ws = require("ws");
const utils = require("./utils");
const os = require("os");

/**
 * @class
 */
class Monitor {
    /**
     *
     * @param {{port: Number, cpu: Boolean, ram: Boolean}} options
     */
    constructor(options) {
        this._options = options;
        this._INTERVAL = 5000;
        this._setupServer();
    }

    _setupServer = () => {
        const { port = 8000, cpu = false, ram = false } = this._options;
        utils.log(`Starting monitoring on port ${port}`, "success");
        const wss = new ws.Server({ port });

        wss.on("error", (error) => utils.log(error, "error"));
        wss.on("connection", this._handleConnection);
    };

    _handleConnection = (socket, req) => {
        utils.log(
            `A new client has connected to the monitoring service from ${req.socket.remoteAddress}`,
            "success"
        );

        const statusInterval = setInterval(async () => {
            try {
                if (socket._readyState === 1) {
                    const systemInfo = await this._getSystemInfo();
                    socket.send(
                        JSON.stringify({
                            Header: "Monitoring",
                            Payload: systemInfo,
                        })
                    );
                }
            } catch (error) {
                console.log(error);
            }
        }, this._INTERVAL);

        socket.on("close", () => {
            utils.log(`A client has disconnected from the monitoring service`, "warning");
            clearInterval(statusInterval);
        });
    };

    _getSystemInfo = () => {
        return new Promise(async (resolve, reject) => {
            const { cpu = false, ram = false } = this._options;
            let cpuCount = "N/A";
            let cpuUsage = "N/A";
            let totalRam = "N/A";
            let ramUsage = "N/A";
            if (cpu) {
                cpuCount = this._getCpuCount();
                cpuUsage = await this._getCpuUsage();
            }

            if (ram) {
                totalRam = this._getTotalMemory();
                //Kullanılan * 100/toplamRam
                ramUsage = ((totalRam - this._getFreeMemory()) * 100) / totalRam;
            }

            return resolve({
                cpu: {
                    count: cpuCount.toString(),
                    usage: cpuUsage.toString().slice(0, 4),
                },
                ram: {
                    total: (totalRam / (1024 * 1024 * 1024)).toString().slice(0, 4),
                    usage: ramUsage.toString().slice(0, 4),
                },
            });
        });
    };

    _getCpuCount = () => os.cpus().length;

    _getCpuUsage = () => {
        const getCpuInfo = () => {
            const cpus = os.cpus();

            let user = 0;
            let nice = 0;
            let sys = 0;
            let idle = 0;
            let irq = 0;
            let total = 0;

            for (let cpu in cpus) {
                if (!cpus.hasOwnProperty(cpu)) continue;
                user += cpus[cpu].times.user;
                nice += cpus[cpu].times.nice;
                sys += cpus[cpu].times.sys;
                irq += cpus[cpu].times.irq;
                idle += cpus[cpu].times.idle;
            }

            total = user + nice + sys + idle + irq;

            return {
                idle: idle,
                total: total,
            };
        };
        return new Promise((resolve) => {
            const stats1 = getCpuInfo();
            const startIdle = stats1.idle;
            const startTotal = stats1.total;

            setTimeout(() => {
                const stats2 = getCpuInfo();
                const endIdle = stats2.idle;
                const endTotal = stats2.total;

                const idle = endIdle - startIdle;
                const total = endTotal - startTotal;
                const perc = idle / total;

                return resolve((1 - perc) * 100);
            }, 1000);
        });
    };

    _getTotalMemory = () => os.totalmem();

    _getFreeMemory = () => os.freemem();
}

module.exports = Monitor;
