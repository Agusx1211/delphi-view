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
    updateReadme(ipfsHash);
});

function updateReadme(ipfsHash) {
  const readmePath = 'README.md'; // Path to your README file
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  const releaseText = 'Latest release on IPFS: ';

  // If README already contains a release link, replace it
  const releaseIndex = readmeContent.indexOf(releaseText);
  if (releaseIndex >= 0) {
      const releasePattern = /Latest release on IPFS: \[ipfs:\/\/[^\]]+\]\(https:\/\/cloudflare-ipfs\.com\/ipfs\/[^\)]+\)/;
      if (readmeContent.match(releasePattern)) {
          const newReleaseText = `Latest release on IPFS: [ipfs://${ipfsHash}](https://cloudflare-ipfs.com/ipfs/${ipfsHash})`;
          readmeContent = readmeContent.replace(releasePattern, newReleaseText);
      } else {
          // If pattern not found, append new link
          const newReleaseText = `${releaseText}[ipfs://${ipfsHash}](https://cloudflare-ipfs.com/ipfs/${ipfsHash})`;
          readmeContent = `${readmeContent}\n${newReleaseText}`;
      }
  } else {
      // If the release section is not present, append it
      const newReleaseText = `${releaseText}[ipfs://${ipfsHash}](https://cloudflare-ipfs.com/ipfs/${ipfsHash})`;
      readmeContent = `${readmeContent}\n${newReleaseText}`;
  }

  fs.writeFileSync(readmePath, readmeContent, 'utf8');
}