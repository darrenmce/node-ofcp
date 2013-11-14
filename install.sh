if [ $1 != "server" ]
  then
    read -p "Enter your firebase url (https://username.firebaseio.com): " firebase_url
    read -p "Enter your firebase SECRET (asdf3456jkle9f....): " firebase_secret
    echo "Creating FIREBASE_CONFIG.json..."
    printf "{\n\t\"ROOT\": \"$firebase_url\",\n\t\"SECRET\": \"$firebase_secret\"\n}\n" > ./FIREBASE_CONFIG.json
fi
if [ $1 != "firebase" ]
  then
    read -p "Enter your server address (http://123.123.123.123): " server_address
    read -p "Enter your server port (3000): " server_port
    echo "Creating SERVER_CONFIG.json..."
    printf "{\n\t\"ADDRESS\": \"$server_address\",\n\t\"PORT\": \"$server_port\"\n}\n" > ./SERVER_CONFIG.json
fi
if [ $1 != "firebase" ] && [ $1 != "server" ] 
  then
    echo "Cloning Poker Evaluator..."
    git clone https://github.com/darrenmce/poker-evaluator.git
    echo "Removing Repo Specifics..."
    rm -rf ./poker-evaluator/.git
    rm ./poker-evaluator/.gitignore
    rm ./poker-evaluator/.travis.yml
    echo "Installing Packages..."
    npm install
fi

