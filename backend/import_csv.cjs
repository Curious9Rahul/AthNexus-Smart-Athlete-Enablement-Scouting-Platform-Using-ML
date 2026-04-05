const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../app/public/Athlete_IDs_final.csv');
const jsonPath = path.join(__dirname, 'data/users.json');

const csvData = fs.readFileSync(csvPath, 'utf-8');
const lines = csvData.split('\n').filter(line => line.trim().length > 0);
const headers = lines[1].split(',');

let existingUsers = [];
try {
  existingUsers = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
} catch(e) {}

const emailExists = (email) => existingUsers.some(u => u.email === email);
const nameExists = (name) => existingUsers.some(u => u.name === name);

let maxId = existingUsers.reduce((max, u) => Math.max(max, parseInt(u.athleteId) || 0), 0);

for(let i=2; i<lines.length; i++) {
  const values = lines[i].split(',');
  if(values.length < headers.length) continue;
  
  let name = values[1];
  let department = values[4];
  let year = parseInt(values[5]) || 1;
  let sport = values[6];
  let activeStatus = values[13] === 'Yes' ? 'ACTIVE' : 'BANNED';
  let email = values[28];

  if(email) email = email.trim();
  if(name) name = name.trim();

  if(!name) continue;
  if(!email || email.length === 0) continue;

  if(emailExists(email) || nameExists(name)) {
    // If it exists, we could update it, but for now just skip to prevent duplicates
    continue;
  }

  maxId++;
  const newUser = {
    athleteId: maxId.toString(),
    name: name,
    email: email,
    sport: sport || "General",
    status: activeStatus,
    joinedAt: "2026-04-04",
    department: department || "General",
    year: year,
    totalRegistrations: parseInt(values[10]) || 0,
    approvedRegistrations: parseInt(values[11]) || 0,
    bannedAt: null,
    banReason: null,
    frozenAt: null,
    frozenReason: null
  };
  
  existingUsers.push(newUser);
}

fs.writeFileSync(jsonPath, JSON.stringify(existingUsers, null, 2));
console.log('Imported successfully. Total users: ' + existingUsers.length);
