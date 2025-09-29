# Makeupbeauty

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.
This project was generated using node version 20.19.3.

# Installation and Setup

# Prerequisites

Ensure you have Node.js version 20.19.3 or compatible installed (recommended for Angular 19.2.15).


# Install the Angular CLI globally.

Steps to Install Node.js and Angular CLI in WSL



Update WSL Package List:Open your WSL terminal (e.g., Ubuntu) and update the package list:
```bash
sudo apt update
```
# Install Node.js:


Use a version manager like nvm (Node Version Manager) for easier management:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20.19.3
nvm use 20.19.3
```


# Verify the installation:
```bash
node -v
```

Should output: v20.19.3.


# Verify npm (Node Package Manager) is installed:
```bash
npm -v
```

Should output a version (e.g., 10.x.x).


# Install the Angular CLI globally:
```bash
npm install -g @angular/cli@19.2.15
```


# Verify the installation:
```bash
ng version
```

Should output Angular CLI version 19.2.15.


# Clone the repository:
```bash
git clone https://github.com/your-repo/makeupbeauty.git
```

Navigate to the project directory:
```bash
cd makeupbeauty
```

 # Install Project Dependencies:

Install the required Node.js packages:
```bash
npm install
```
# Starting the Development Server

To start a local development server, run:
```bash
ng serve
```

Once the server is running, open your browser and navigate to http://localhost:4200/. The application will automatically reload whenever you modify any of the source files. Note: Ensure port 4200 is accessible from Windows if needed (WSL2 may require additional network configuration).

# Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the Angular CLI Overview and Command Reference page.

# Project File Structure

.
├── public
└── src
    ├── app
    │   ├── pages
    │   │   ├── auth
    │   │   │   ├── login
    │   │   │   └── register
    │   │   ├── carrito
    │   │   │   └── carrito
    │   │   ├── categorias
    │   │   │   ├── labios
    │   │   │   ├── ojos
    │   │   │   └── rostros
    │   │   └── homepage
    │   │       └── homepage
    │   └── shared
    │       ├── footer
    │       └── header
    └── assets

19 directories
