cd /home/pi/CarameloBot


#node . deploy-commands.js
#screen -S CarameloBot node bot.js

pm2 start deploy-commands.js
pm2 start bot.js --name CarameloBot