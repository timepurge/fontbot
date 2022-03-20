## How to use FontBot

Install Fontbot

`npm install fontbot`

Create a `sites.txt` file with list of sites, each site on a newline.

### Example:
     a.com
     b.com

Usage:
     
     const fontbot = require("fontbot");
     fontbot.init("./sites.txt")
     