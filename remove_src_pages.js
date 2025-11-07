const fs = require('fs');
const path = require('path');

const srcPagesPath = path.join(__dirname, 'src', 'pages');

function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        console.log(`Found ${dirPath}, attempting to remove...`);
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log('✓ Successfully removed src/pages directory!');
            console.log('\nYou can now restart your dev server.');
            return true;
        } catch (error) {
            console.error('✗ Failed to remove directory.');
            console.error('\nPlease:');
            console.error('1. Stop your dev server (Ctrl+C)');
            console.error('2. Close any editors with files from src/pages open');
            console.error('3. Run this script again: node remove_src_pages.js');
            console.error('\nError:', error.message);
            return false;
        }
    } else {
        console.log('✓ src/pages directory not found - already removed!');
        return true;
    }
}

removeDirectory(srcPagesPath);
