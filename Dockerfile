# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application to the container
COPY . .

# Expose port 8132 to the outside world
EXPOSE 8132

# Define the command to run the application
CMD ["node", "app.js"]
