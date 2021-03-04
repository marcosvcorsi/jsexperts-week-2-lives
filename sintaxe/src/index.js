const assert = require('assert');
const Employee = require('./Employee');
const Manager = require('./Manager');
const Util = require('./util');

const GENDER = {
  male: 'male',
  female: 'female',
}

{
  const employee = new Employee({
    name: 'XuxaDaSilva',
    gender: GENDER.female
  })

  assert.throws(() => employee.birthYear, { message: 'you must define age first!!'})
}

const CURRENT_YEAR = 2021;

Date.prototype.getFullYear = () => CURRENT_YEAR;

{
  const employee = new Employee({
    name: 'Jao',
    gender: GENDER.male,
    age: 20
  })

  assert.deepStrictEqual(employee.name, 'Mr. Jao');
  assert.deepStrictEqual(employee.age, undefined);
  assert.deepStrictEqual(employee.grossPay, Util.formatCurrency(5000.40));
  assert.deepStrictEqual(employee.netPay, Util.formatCurrency(4000.32));

  const expectedBirthYear = 2001;
  assert.deepStrictEqual(employee.birthYear, expectedBirthYear);

  employee.birthYear = new Date().getFullYear() - 80;
  assert.deepStrictEqual(employee.birthYear, expectedBirthYear);

  employee.age = 80;
  assert.deepStrictEqual(employee.birthYear, 1941);
}

{
  const manager = new Manager({
    name: 'Champa',
    age: 40,
    gender: GENDER.female,
  });

  
  assert.deepStrictEqual(manager.name, 'Ms. Champa');
  assert.deepStrictEqual(manager.age, undefined);
  assert.deepStrictEqual(manager.birthYear, 1981);
  assert.deepStrictEqual(manager.grossPay, Util.formatCurrency(5000.40));
  assert.deepStrictEqual(manager.bonuses, Util.formatCurrency(2000));
  assert.deepStrictEqual(manager.netPay, Util.formatCurrency(6000.32));
  
}