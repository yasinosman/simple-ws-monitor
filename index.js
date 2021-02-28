const Monitor = require("./lib/Monitor");

new Monitor({
    port: 8000,
    cpu: true,
    ram: true,
});

module.exports = Monitor;
