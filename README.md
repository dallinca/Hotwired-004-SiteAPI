# Hotwired Site/Admin API

## Prerequisites

1. Mongodb server setup
Default db address is "mongodb://localhost:27017/hw". Note this can be updated as necessary in the file "config/config.js" in the "database" property.

## Setup

1. Run Commands:
npm install
cp config/config_EXAMPLE.js config/config.js
cp config/configIpPort_EXAMPLE.js config/configIpPort.js

2. Edit File config/config.js
  - "secret" should be updated to an safe kept value (used for JWT encryption)
  - "email" object values should be updated to valid gmail api values (used to enable emails for account management features)
  - "init.rootaccount" should be set to the desired root account information to initialize. Changing the password after initialization is recommended for security.

3. Edit File config/configIpPort.js
  - "ipv4" array should be updated to include the ipv4 address of the server. localhost (127.0.0.1) is included by default.

## Run Server

npm run start

## Run Initialization endpoint

Once you see "Connected to database" in the console:

ctrl + c
npm run init

This will initialize root account setup (using the account set in config/config.js > init.rootaccount). An email will be sent if the gmail api data was set correctly. After initialization the Root account will have access to endpoints for managing the site.

## Verify process is running

ps -ef | grep node

You should see the node server still running in the background

## Stopping the server

Get the process ID from the 'ps' command and run the kill command

kill {ID}