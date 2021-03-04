const Employee = require("./Employee");
const Util = require("./util");

class Manager extends Employee {
  #bonuses = 2000;

  get bonuses () {
    return Util.formatCurrency(this.#bonuses);
  }

  get netPay() {
    const final = Util.unFormatCurrency(super.netPay) + this.#bonuses;

    return Util.formatCurrency(final);
  }
}

module.exports = Manager;