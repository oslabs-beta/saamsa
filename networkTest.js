const pcap = require('pcap');

const tcpTracker = new pcap.TCPTracker();
const pcapSession = pcap.createSession('lo0');

pcapSession.on('packet', (rawPacket) => {
  const decodedPacket = pcap.decode.packet(rawPacket);
  console.log(decodedPacket.payload.payload.payload.data.toString());
});
