const { loadDebts, saveDebts } = require('./storage');

async function runReminders(client) {
  const debts = loadDebts();
  const now = new Date();

  for (const [username, userDebts] of Object.entries(debts)) {
    const user = client.users.cache.find(u => u.username.toLowerCase() === username);
    if (!user) continue;

    for (const debt of userDebts) {
      if (!debt.paymentPlan) continue;

      const due = new Date(debt.paymentPlan.nextDue);
      if (due <= now) {
        try {
          await user.send(`📢 Payment Reminder: You owe $${debt.amount} for **${debt.reason}**. Your next payment of $${debt.paymentPlan.amount} is due now.`);
          const nextDue = new Date();
          if (debt.paymentPlan.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
          if (debt.paymentPlan.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
          debt.paymentPlan.nextDue = nextDue.toISOString();
        } catch (e) {
          console.error(`❌ DM failed for ${username}`);
        }
      }
    }
  }

  saveDebts(debts);
}

module.exports = { runReminders };
