module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'CHANGE_ME_SECRET',
  jwtExpiresIn: '7d'
};