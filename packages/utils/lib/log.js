const { Signale } = require("signale");
const signale = new Signale({
  types: {
    info: {
      badge: "",
      label: ""
    }
  }
});

module.exports = signale;
