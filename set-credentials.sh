#!/bin/bash

# This is a script to write the credentials.json file using user input
echo "Type your Netflix user name:"
read username

echo "Type your Netflix user password:"
read password

cat > /app/credentials.json << endoffile
{
	"user": "$username",
	"pass": "$password"
}
endoffile