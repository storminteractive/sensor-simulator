const chalk = require('chalk');
const moment = require('moment');

const logRequest = ((req,res,next)=>{
    const startTime = new Date().getTime();
    res.on('finish', () => {
      const finishTime = new Date().getTime();
      const duration = finishTime - startTime;
      const humanTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      
      let reqBody = req.body;
      if(reqBody.password){ reqBody.password = '********'; }
      let remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      console.log(chalk.blueBright(`${humanTime}`, chalk.greenBright(remoteIp, chalk.whiteBright(`${req.method} ${req.originalUrl} `,chalk.yellowBright(`${res.statusCode} ${duration}ms`)))));
      if(Object.entries(req.body).length > 0){
          console.log(chalk.blueBright(`${humanTime}`,chalk.greenBright(remoteIp, chalk.cyanBright(`BODY: ${JSON.stringify(reqBody)}`))));
      }
    });
    next();
})

module.exports = logRequest;
