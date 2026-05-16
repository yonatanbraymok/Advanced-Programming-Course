import sys
import socket

from protocol_message import read_response, send_line


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

        while True:
            try:
                user_input = input()

                if not user_input.strip():
                    continue

                # Send what the user typed, with '\n' at the end (Ex2 rule).
                send_line(client_socket, user_input)

                # Wait for the full server reply before asking for the next command.
                response = read_response(client_socket)

                if not response:
                    break

                # Server lines already end with '\n' — don't add another one.
                print(response, end="")

            except (EOFError, KeyboardInterrupt):
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
