if [ "$1" != "server" ] && [ "$1" != "mongo" ]
  then
    read -p "Enter your firebase url (https://username.firebaseio.com): " firebase_url
    read -p "Enter your firebase SECRET (asdf3456jkle9f....): " firebase_secret
    read -p "Firebase debug? (y/n): " firebase_debug
    echo "Creating FIREBASE_CONFIG.json..."
    printf "{\n\t\"ROOT\": \"$firebase_url\",\n\t\"SECRET\": \"$firebase_secret\",\n\t\"DEBUG\": \"$firebase_debug\"\n}\n" > ./FIREBASE_CONFIG.json
fi
if [ "$1" != "firebase" ] && [ "$1" != "server" ]
  then
    read -p "Enter your MongoDB server (mongodb://127.0.0.1:27017): " mongo_addr
    read -p "Enter your MongoDB database name (test): " mongo_db
    echo "Creating MONGO_CONFIG.json..."
    printf "{\n\t\"SERVER\": \"$mongo_addr\",\n\t\"DATABASE\": \"$mongo_db\"\n}\n" > ./MONGO_CONFIG.json
fi
if [ "$1" != "firebase" ] && [ "$1" != "mongo" ]
  then
    read -p "Enter your server address (http://123.123.123.123): " server_address
    read -p "Enter your server port (3000): " server_port
    echo "Creating SERVER_CONFIG.json..."
    printf "{\n\t\"ADDRESS\": \"$server_address\",\n\t\"PORT\": \"$server_port\"\n}\n" > ./SERVER_CONFIG.json
fi
if [ "$1" != "firebase" ] && [ "$1" != "server" ] && [ "$1" != "mongo" ]
  then
    echo "Cloning Poker Evaluator..."
    git clone https://github.com/darrenmce/poker-evaluator.git
    echo "Removing Repo Specifics..."
    rm -rf ./poker-evaluator/.git
    rm ./poker-evaluator/.gitignore
    rm ./poker-evaluator/.travis.yml
    echo "Installing Packages..."
    npm install || (npm install || echo "failed twice to install packages, run 'npm install' manually and debug")
fi

