module.exports = {
  log: (...params) => {
    console.log(new Date().toISOString(), ...params);
  },
  error: (...params) => {
    console.error(new Date().toISOString(), ...params);
  },
};
