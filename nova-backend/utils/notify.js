const User = require('../models/User');
const Child = require('../models/Child');

const pushParentNotification = async (childId, message) => {
  const child = await Child.findById(childId);
  if (!child) throw new Error("Child not found");

  const parent = await User.findById(child.parent);
  if (!parent) throw new Error("Parent not found");

  const logEntry = {
    message,
    date: new Date()  // ✅ <-- This line guarantees correct timestamp
  };

  console.log("📨 Final notification payload:", logEntry);

  await User.findByIdAndUpdate(parent._id, {
    $push: { notifications: logEntry }
  });
};

module.exports = {
  pushParentNotification,
};
