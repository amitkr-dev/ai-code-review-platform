const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.ax8ffsy.mongodb.net",
  (err, addresses) => {
    console.log(err || addresses);
  }
);