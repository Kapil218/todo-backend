import bcrypt from "bcrypt";

const hashValue = (value) => {
  const salt = bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
};

const compareValue = (enteredValue, storedValue) => {
  return bcrypt.compare(enteredValue, storedValue);
};

export { hashValue, compareValue };
