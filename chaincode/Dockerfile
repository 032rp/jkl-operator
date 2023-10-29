# Use a minimal base image (e.g., Alpine Linux) to keep the image size small
FROM node:18-alpine
# Create a directory for the chaincode
WORKDIR /app/chaincode/
# Copy the Node.js chaincode logic into the image
COPY . . 
RUN npm install  && printf "npm run start\n" > entrypoint.sh
EXPOSE 9999
# Chaincode command (customize as needed)
CMD ["/bin/sh","entrypoint.sh"]
