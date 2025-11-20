const { parse } = require('csv-parse/sync');
const Line = require('../models/Line');

// تنظيف العنوان
function normalize(h) {
  return h.trim().toLowerCase().replace(/\s+/g, '');
}

// كل الأسماء المحتملة لكل عمود
const HEADER_MAP = {
  personName: ['name','personname','الاسم','اسم','اسمالموظف','اسم_الموظف'],
  phoneNumber: ['phone','phonenumber','mobile','رقمالهاتف','الهاتف','الموبايل','الجوال','الرقم'],
  jobTitle: ['jobtitle','title','position','العنوانالوظيفي','الوظيفة','الوظيفه'],
  workplace: ['workplace','location','branch','project','مكانالعمل','الموقع','المشروع','الفرع'],
  packageAmount: ['packageamount','amount','price','value','مبلغالباقة','سعرباقة','السعر','المبلغ'],
  expiryDate: ['expirydate','expiredate','enddate','تاريخالانتهاء','تاريخانتهاء','التجديد','تاريخالتجديد']
};

function buildColumnMap(headers) {
  const norm = headers.map(normalize);
  const map = {};

  for (const [field, candidates] of Object.entries(HEADER_MAP)) {
    for (let i = 0; i < norm.length; i++) {
      if (candidates.includes(norm[i])) {
        map[field] = headers[i];
        break;
      }
    }
  }
  return map;
}

function parseNumber(v) {
  if (!v) return undefined;
  const clean = String(v).replace(/[^\d.,]/g, '').replace(',', '.');
  const n = Number(clean);
  return isNaN(n) ? undefined : n;
}

function parseDate(v) {
  if (!v) return undefined;
  const s = String(v).trim();

  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }

  return undefined;
}

async function importLinesFromCsv(buffer) {
  const text = buffer.toString('utf8');

  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  if (!rows.length) return 0;

  const headers = Object.keys(rows[0]);
  const columnMap = buildColumnMap(headers);

  if (!columnMap.personName || !columnMap.phoneNumber) {
    throw new Error('CSV يجب أن يحتوي اسم ورقم هاتف');
  }

  let count = 0;

  for (const row of rows) {
    try {
      const name = String(row[columnMap.personName] || '').trim();
      const phone = String(row[columnMap.phoneNumber] || '').trim();

      if (!name || !phone) continue;

      const jobTitle = columnMap.jobTitle ? String(row[columnMap.jobTitle] || '').trim() : '';
      const workplace = columnMap.workplace ? String(row[columnMap.workplace] || '').trim() : '';
      const amount = columnMap.packageAmount ? parseNumber(row[columnMap.packageAmount]) : undefined;
      const expiry = columnMap.expiryDate ? parseDate(row[columnMap.expiryDate]) : undefined;

      const exists = await Line.findOne({ phoneNumber: phone }).lean();
      if (exists) continue;

      await Line.create({
        personName: name,
        phoneNumber: phone,
        jobTitle,
        workplace,
        packageAmount: amount,
        expiryDate: expiry
      });

      count++;
    } catch (err) {
      console.error('Row error:', err);
    }
  }

  return count;
}

module.exports = { importLinesFromCsv };