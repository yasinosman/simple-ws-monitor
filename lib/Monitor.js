const ws = require("ws");
const utils = require("./utils");
const os = require("os");

/**
 * @class
 */
class Monitor {
    /**
     *
     * @param {{port: Number, cpu: Boolean, ram: Boolean, interval:Number}} options
     */
    constructor(options) {
        this._options = options;
        const { interval = 2000 } = options;
        this._INTERVAL = interval;
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
            const { cpu = false, ram = false, cpuCores = false } = this._options;
            let cpuCount = "N/A";
            let cpuUsage = "N/A";
            let cores = [];
            let totalRam = "N/A";
            let ramUsage = "N/A";
            if (cpu) {
                cpuCount = this._getCpuCount();
                cpuUsage = await this._getCpuUsage();

                if (cpuCores) {
                    cores = await this._getCpuCoreState();
                }
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
                    cores: cores,
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

    _getCpuCoreState = () => {
        const getCpuCoreInfo = () => {
            const cpus = os.cpus();

            let idleTimes = [];
            let totalTimes = [];
            let speeds = [];
            const model = cpus[0].model;

            cpus.forEach((core) => {
                const { user, nice, sys, irq, idle } = core.times;

                idleTimes.push(idle);
                totalTimes.push(user + nice + sys + idle + irq);
                speeds.push(core.speed);
            });

            return {
                idleTimes,
                totalTimes,
                model,
                speeds,
            };
        };
        return new Promise((resolve) => {
            const stats1 = getCpuCoreInfo();
            const idleTimes1 = stats1.idleTimes;
            const totalTimes1 = stats1.totalTimes;
            const model = stats1.model;

            setTimeout(() => {
                const stats2 = getCpuCoreInfo();
                const idleTimes2 = stats2.idleTimes;
                const totalTimes2 = stats2.totalTimes;
                const speeds = stats2.speeds;

                let report = [];
                for (let i = 0; i < totalTimes2.length; i++) {
                    const idle = idleTimes2[i] - idleTimes1[i];
                    const total = totalTimes2[i] - totalTimes1[i];
                    const perc = idle / total;

                    const usage = ((1 - perc) * 100).toString().slice(0, 4);

                    report.push({
                        index: i + 1,
                        model: model,
                        speed: speeds[i],
                        usage,
                    });
                }

                return resolve(report);
            }, 1000);
        });
    };

    _getTotalMemory = () => os.totalmem();

    _getFreeMemory = () => os.freemem();
}

module.exports = Monitor;
