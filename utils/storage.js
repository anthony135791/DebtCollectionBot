const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = path.join(__dirname, '..', 'debts.json');

function loadDebts() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveDebts(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function addDebt(username, amount, reason, userId = null, channelId = null) {
  const debts = loadDebts();
  const name = username.toLowerCase();
  if (!debts[name]) debts[name] = [];

  debts[name].push({
    id: generateId(),
    amount,
    reason,
    timestamp: new Date().toISOString(),
    ...(userId && { userId }),
    ...(channelId && { channelId })
  });

  saveDebts(debts);
}

function clearDebt(username) {
  const debts = loadDebts();
  delete debts[username.toLowerCase()];
  saveDebts(debts);
}

function getUserDebts(username) {
  const debts = loadDebts();
  return debts[username.toLowerCase()] || [];
}

function getAllDebtors() {
  const debts = loadDebts();
  return Object.keys(debts);
}

function setPaymentPlan(username, debtId, plan) {
  const debts = loadDebts();
  const userDebts = debts[username.toLowerCase()];
  if (!userDebts) return false;

  const debt = userDebts.find(d => d.id === debtId);
  if (!debt) return false;

  debt.paymentPlan = plan;
  saveDebts(debts);
  return true;
}

async function collectPayment(username, debtId, amount, client = null) {
  const debts = loadDebts();
  const userDebts = debts[username.toLowerCase()];
  if (!userDebts) return false;

  const debt = userDebts.find(d => d.id === debtId);
  if (!debt) return false;

  debt.amount -= amount;

  if (debt.amount <= 0) {
    debts[username.toLowerCase()] = userDebts.filter(d => d.id !== debtId);
  }

  saveDebts(debts);
  return true;
}

function findDebtById(debtId) {
  const debts = loadDebts();
  for (const [username, userDebts] of Object.entries(debts)) {
    const debt = userDebts.find(d => d.id === debtId);
    if (debt) return { username, debt };
  }
  return null;
}

function linkDiscordUser(debtId, userId) {
  const debts = loadDebts();
  for (const [username, userDebts] of Object.entries(debts)) {
    const debt = userDebts.find(d => d.id === debtId);
    if (debt) {
      debt.userId = userId;
      saveDebts(debts);
      return true;
    }
  }
  return false;
}

module.exports = {
  loadDebts,
  saveDebts,
  addDebt,
  clearDebt,
  getUserDebts,
  getAllDebtors,
  setPaymentPlan,
  collectPayment,
  findDebtById,
  linkDiscordUser,
  generateId
};
