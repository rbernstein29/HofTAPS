from socket import *
import sys
import os

# Set the server port
serverPort = 6789

# Create a TCP server socket
serverSocket = socket(AF_INET, SOCK_STREAM)

# Allow reuse of the socket address (prevents "Address already in use" error)
serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

# Bind to all network interfaces (so you can access it from your phone)
serverSocket.bind(('0.0.0.0', serverPort))

# Start listening for connections (up to 5 clients in queue)
serverSocket.listen(5)
print(f'Server running on http://0.0.0.0:{serverPort}/ (Accessible from your network)')

while True:
    try:
        # Accept incoming connection
        connectionSocket, addr = serverSocket.accept()
        print(f"Connection from {addr}")

        # Receive the request from the client
        message = connectionSocket.recv(1024).decode()
        if not message:
            connectionSocket.close()
            continue

        print(f"Request message:\n{message}")

        # Extract the requested filename from the GET request
        request_line = message.split("\n")[0]  # e.g., "GET /HTAPHome.html HTTP/1.1"
        parts = request_line.split()

        if len(parts) < 2:
            connectionSocket.send("HTTP/1.1 400 Bad Request\r\n\r\n".encode())
            connectionSocket.close()
            continue

        filename = parts[1].lstrip("/")  # Remove leading "/"

        # If no file is specified, serve the default "HTAPHome.html"
        if filename == "":
            filename = "HTAPHome.html"

        # Prevent directory traversal attacks
        if ".." in filename or filename.startswith("/"):
            connectionSocket.send("HTTP/1.1 403 Forbidden\r\n\r\n".encode())
            connectionSocket.send("<html><body><h1>403 Forbidden</h1></body></html>\r\n".encode())
            connectionSocket.close()
            continue

        # Check if the file exists
        if not os.path.isfile(filename):
            print(f"File not found: {filename}")
            connectionSocket.send("HTTP/1.1 404 Not Found\r\n\r\n".encode())
            connectionSocket.send("<html><body><h1>404 Not Found</h1></body></html>\r\n".encode())
        else:
            # Open and read the requested file in binary mode
            with open(filename, "rb") as f:
                outputdata = f.read()

            # Send HTTP response headers
            connectionSocket.send("HTTP/1.1 200 OK\r\n".encode())
            connectionSocket.send("Content-Type: text/html\r\n\r\n".encode())

            # Send the file content as binary
            connectionSocket.send(outputdata)


    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Close the client connection
        connectionSocket.close()
