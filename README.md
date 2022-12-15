# Hey Addy
An email assistant powered by ChatGPT

## How to contribute?
> There are tasks to be done
- Pick up a task from the list below or [](here) (ZenHub link coming soon)
    - *Reverse engineer gmail to access email threads + history*
    - *Make chrome extension fire up when gmail tab is detected + email is opened*
- Make a PR


## How to set up
- Clone Repo
- Install Firebase CLI globally on your local machine
    - Run `npm install -g firebase-tools`
- After Firebase CLI is installed login to your Firebase Account:
    - Run `firebase login` and follow the instructions
- Install npm packages
    - cc into the functions directory and run `npm install`
- Make a Firebase Project on https://console.firebase.google.com (Give it any name)
- Replace default project name in `.firebaserc` file to your Firebase Project name
- Run `npm run dev` or `firebase serve --only functions,hosting`
    - This wil fire up a firebase emulator locally on http://localhost:5001/hey-addy-chatgpt/us-central1/api



## Credit
- Unofficial Node.js API by transitive-bullshit et al. (https://github.com/transitive-bullshit/chatgpt-api)