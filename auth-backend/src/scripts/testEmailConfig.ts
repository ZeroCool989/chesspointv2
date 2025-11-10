import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('\n=== E-Mail Configuration Check ===\n');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log('GMAIL_USER:', GMAIL_USER ? '✓ Set' : '✗ NOT SET');
if (GMAIL_USER) {
  console.log('  Value:', GMAIL_USER);
}

console.log('\nGMAIL_APP_PASSWORD:', GMAIL_APP_PASSWORD ? '✓ Set' : '✗ NOT SET');
if (GMAIL_APP_PASSWORD) {
  console.log('  Value:', '*'.repeat(GMAIL_APP_PASSWORD.length) + ' (hidden)');
}

console.log('\nEMAIL_FROM:', EMAIL_FROM || 'Using default');
console.log('FRONTEND_URL:', FRONTEND_URL || 'Using default (http://localhost:3000)');

console.log('\n=== Result ===');
if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  console.log('✓ E-Mail configuration is complete!');
  console.log('✓ Password reset emails should work.');
} else {
  console.log('✗ E-Mail configuration is incomplete!');
  console.log('\nPlease add to auth-backend/.env:');
  if (!GMAIL_USER) {
    console.log('  GMAIL_USER=chesspoint.io@gmail.com');
  }
  if (!GMAIL_APP_PASSWORD) {
    console.log('  GMAIL_APP_PASSWORD=your-google-app-password');
  }
}

console.log('\n');

