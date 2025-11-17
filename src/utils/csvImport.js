const { parse } = require('csv-parse/sync');
const Line = require('../models/Line');

async function importLinesFromCsv(buffer) {
  const content = buffer.toString('utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
  let inserted = 0;
  for (const row of records) {
    const personName = row.person_name || row['الاسم'] || row.name || '';
    const phoneNumber = row.phone_number || row['الرقم'] || row.phone || '';
    const jobTitle = row.job_title || row['العنوان_الوظيفي'] || '';
    const workplace = row.workplace || row['مكان_العمل'] || '';
    const packageAmountRaw = row.package_amount || row['مبلغ_الباقة'] || null;
    const expiryStr = row.expiry_date || row['تاريخ_الانتهاء'] || row.expiry || '';
    if (!personName || !phoneNumber || !expiryStr) continue;
    const expiryDate = new Date(expiryStr);
    if (isNaN(expiryDate)) continue;
    const packageAmount = packageAmountRaw ? Number(String(packageAmountRaw).replace(/[^0-9]/g,'')) : undefined;
    await Line.create({ personName, phoneNumber, jobTitle, workplace, packageAmount, expiryDate });
    inserted++;
  }
  return inserted;
}

module.exports = { importLinesFromCsv };