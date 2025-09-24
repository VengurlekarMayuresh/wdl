import mongoose from 'mongoose';
import User from '../models/User.js';

const uri = 'mongodb://localhost:27017/healthcare-management';

async function main() {
  try {
    await mongoose.connect(uri);
    const email = 'sarah.johnson@healthcenter.com';
    const password = 'doctor123';

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.log(JSON.stringify({ ok: false, reason: 'user_not_found' }));
      process.exit(1);
    }
    const isValid = await user.comparePassword(password);
    console.log(JSON.stringify({ ok: true, isValid }));
    process.exit(isValid ? 0 : 2);
  } catch (e) {
    console.error(e);
    process.exit(3);
  }
}

main();
