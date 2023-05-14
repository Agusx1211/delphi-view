const { exec } = require('child_process');
const fs = require('fs');

// Executing the pinata-cli command
exec('./node_modules/.bin/pinata-cli -u ./dist/', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    // Parse the output to get the IPFS hash
    const stdoutLines = stdout.split('\n');
    const pinataOutputLine = stdoutLines.find(line => line.includes('IpfsHash'));
    const ipfsHash = pinataOutputLine.split("\'")[1].split("\'")[0]
    const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
    updateReadme(ipfsUrl);
});

function updateReadme(ipfsUrl) {
    const readmePath = 'README.md'; // Path to your README file
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    const releaseText = '## Latest Release\n';

    // If README already contains a release link, replace it
    const releaseIndex = readmeContent.indexOf(releaseText);
    if (releaseIndex >= 0) {
        const releasePattern = /\[View the latest release here]\(https:\/\/ipfs\.io\/ipfs\/[^\)]+\)/;
        if (readmeContent.match(releasePattern)) {
            readmeContent = readmeContent.replace(releasePattern, `[View the latest release here](${ipfsUrl})`);
        } else {
            // If pattern not found, append new link
            readmeContent = `${readmeContent}\n${releaseText}[View the latest release here](${ipfsUrl})`;
        }
    } else {
        // If the release section is not present, append it
        readmeContent = `${readmeContent}\n${releaseText}[View the latest release here](${ipfsUrl})`;
    }

    fs.writeFileSync(readmePath, readmeContent, 'utf8');
}
