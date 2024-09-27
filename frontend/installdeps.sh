#!/bin/bash
RED="\e[31m"
GREEN="\e[32m"
ENDCOLOR="\e[0m"
echo ${RED}WARNING! If you use a non-ubuntu based distro, then you do not need this script, ensure you have node/npm installed.${ENDCOLOR}
read -p "Press enter to continue"
sudo apt update
sudo apt install nodejs npm
echo ${GREEN}Installing yarn npm ${ENDCOLOR}
sudo npm install yarn
sudo npm install react react-scripts
sudo npm install create-react-app
