cd /home/pi/CarameloBot

npm run deploy

#screen -S CarameloBot node bot.js
pm2 start bot.js --name CarameloBot