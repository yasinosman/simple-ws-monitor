# simple-ws-monitor

## Description

[simple-ws-monitor](https://github.com/yasinosman/simple-ws-monitor) is a monitoring app runs on `Node`.

It is aimed to periodically send various information
about the system to the users such as `CPU` and `RAM` usage.

## Examples

#### Server:

```javascript
const Monitor = require("simple-ws-monitor");

const PORT = 8000;

const monitoringService = new Monitor({
    port: 8000,
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
            count: "4",
            usage: "1.25",
        },
        ram: {
            total: "16.4",
            usage: "41.30",
        }
    }
}
```

## Installation

`npm i simple-ws-monitor`

## Usage

#### Import package on server side

```javascript
const Monitor = require("simple-ws-monitor");
```

#### Start service

```javascript
const monitoringService = new Monitor({
    port: 8000,
    cpu: true,
    ram: true,
});
```

simple-monitor is now ready and waiting for connections.

## Development

#### Clone repository:

```bash
git clone https://github.com/yasinosman/simple-ws-monitor
cd simple-ws-monitor
```

#### Install packages:

```
npm install
```

#### Start development server

```
npm run dev
```

## Contributing

Feel free to create issues or create pull requests.
