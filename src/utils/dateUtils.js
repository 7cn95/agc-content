function classifyStatus(expiryDate) {
  if (!expiryDate) return 'UNKNOWN';
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(expiryDate); d.setHours(0,0,0,0);
  if (isNaN(d)) return 'UNKNOWN';
  const diffDays = (d - today)/(1000*60*60*24);
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 7) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

function renewForOneMonth(expiryDate) {
  const d = new Date(expiryDate || new Date());
  const day = d.getDate();
  d.setMonth(d.getMonth()+1);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

module.exports = { classifyStatus, renewForOneMonth };