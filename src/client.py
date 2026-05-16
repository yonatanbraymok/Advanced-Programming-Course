import sys
import socket

def main():
    if len(sys.argv) != 3:
        print("Usage: python client.py <server_ip> <server_port>")
        sys.exit(1)

    server_ip = sys.argv[1]
    
    try:
        server_port = int(sys.argv[2])
    except ValueError:
        print("Error: Port must be a valid integer.")
        sys.exit(1)

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        client_socket.connect((server_ip, server_port))
        
        # APC-99: Client Interactive Loop
        while True:
            try:
                # APC-100: Implement while True loop with input()
                user_input = input()
                
                # APC-101: Handle empty input and edge cases
                if not user_input.strip():
                    continue
                
                # The instructions dictate every command sent must end with a newline [cite: 45]
                message = user_input + "\n"
                client_socket.sendall(message.encode('utf-8'))
                
                # APC-102: Implement logic to read the server's response
                # We read up to 4096 bytes, which is standard buffer size and sufficient for these responses.
                response = client_socket.recv(4096).decode('utf-8')
                
                if not response:
                    # If recv returns empty bytes, the server has closed the connection.
                    break
                    
                # The instructions state the server's output already ends with a newline[cite: 45].
                # We use end="" to prevent Python's print() from adding a second, unauthorized newline.
                print(response, end="")
                
            except (EOFError, KeyboardInterrupt):
                # Handle Ctrl+C or Ctrl+D gracefully to exit the loop
                break

    except ConnectionRefusedError:
        print(f"Error: Connection refused. Ensure the server is running at {server_ip}:{server_port}.")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected socket error occurred: {e}")
        sys.exit(1)
    finally:
        client_socket.close()

if __name__ == "__main__":
    main()