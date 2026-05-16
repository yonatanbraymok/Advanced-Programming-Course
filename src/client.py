import sys
import socket

def main():
    # APC-77: Implement sys.argv parsing for Server IP and Port.
    # The client will receive the server's IP address and port number as arguments[cite: 33].
    # These must be command-line arguments, not requested from the user via console input[cite: 34].
    if len(sys.argv) != 3:
        print("Usage: python3 client.py <server_ip> <server_port>")
        sys.exit(1)

    server_ip = sys.argv[1]
    
    try:
        server_port = int(sys.argv[2])
    except ValueError:
        print("Error: Port must be a valid integer.")
        sys.exit(1)

    # APC-78: Implement socket.socket connection logic.
    # The client will be implemented in Python 3[cite: 31].
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # APC-79: Add basic error handling for "Connection Refused."
    try:
        # The client establishes a TCP connection with the server[cite: 35].
        client_socket.connect((server_ip, server_port))
        
        # The client uses this same TCP connection against the server throughout its entire run[cite: 38].
        # TODO: The interactive console loop (APC-99) will be implemented here.
        
    except ConnectionRefusedError:
        print(f"Error: Connection refused. Ensure the server is running at {server_ip}:{server_port}.")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected socket error occurred: {e}")
        sys.exit(1)
    finally:
        # Note: Closing is placed here for structural completeness, 
        # but in the final version, this happens after the interactive loop terminates.
        client_socket.close()

if __name__ == "__main__":
    main()