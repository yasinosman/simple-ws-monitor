# simple-monitor

## Description

[simple-monitor](https://github.com/yasinosman/simple-monitor) is a monitoring app runs on `Node`.

It is aimed to periodically send various information
about the system to the users such as `CPU` and `RAM` usage.

## Examples

#### Server:

```javascript
const Monitor = require("simple-monitor");

const PORT = 8000;

const monitoringService = new Monitor(PORT, {
    cpu: true,
    ram: true,
});
```

#### Client:

```javascript
const PORT = 8000;
const monitoringService = new WebSocket(`ws://localhost:${PORT}`);

monitoringService.onerror = (e) => console.log(e);
monitoringService.onmessage = (msg) => console.log(JSON.parse(msg));
```

#### Result (in client console):

```javascript
{
    Header: "Monitoring",
    Payload: {
        cpu: {
            count: 4,
            usage: 27,
        },
        ram: {
            total: 16,
            free: 14.3,
        }
    }
}
```

## Installation

`npm i simple-monitor`

## Usage

#### Import package on server side

```javascript
const Monitor = require("simple-monitor");
```

#### Start service

```javascript
const monitoringService = new Monitor(8000, {
    cpu: true,
    ram: true,
});
```

simple-monitor is now ready and waiting for connections.

## Development

```bash
git clone https://github.com/yasinosman/simple-monitor
cd simple-monitor
npm install
```

## Contributing

Feel free to create issues or create pull requests.
