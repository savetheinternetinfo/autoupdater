# autoupdater

**Installation & Quick setup:**

0. Open up your favourite terminal (and navigate somewhere you want to download the repository to) <br><br>
1. Make sure you have nodejs installed. Test by  entering <br>
$ `node -v` <br>
If this returns a version number, NodeJS is installed. **If not**, get NodeJS <a href="https://nodejs.org/en/download/package-manager/">here</a>. <br><br>
2. Clone the repository and navigate to it. <br>
$ `git clone https://github.com/savetheinternetinfo/autoupdater.git && cd autoupdater` <br><br>
3. Install all dependencies by typing <br>
$ `npm i`<br><br>
4. Copy [config.template.json](https://github.com/savetheinternetinfo/autoupdater/blob/master/config.template.json) and rename it to `config.json` <br><br>
5. Configure everything inside `config.json` <br><br>
6. Start by typing <br>
$ `npm start` <br><br>
7. ALTERNATIVELY: Use a tool like [pm2](http://pm2.keymetrics.io/) to keep the script running.
