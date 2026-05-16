# APC-80 / APC-82: Python side of the newline protocol.
# Server and client agree: one message = one line ending with '\n'.

from __future__ import annotations

import socket
from typing import Optional

# After reading a line, wait this long to see if more lines are coming.
_DEFAULT_IDLE_TIMEOUT_S = 0.05


def append_newline(text: str) -> str:
    # Ex2: every command we send must end with '\n'.
    if text.endswith("\n"):
        return text
    return text + "\n"


def send_line(sock: socket.socket, text: str) -> None:
    # Turn "POST 1 2" into "POST 1 2\n" and send all bytes.
    sock.sendall(append_newline(text).encode("utf-8"))


def read_line(sock: socket.socket) -> Optional[str]:
    # Read one byte at a time until '\n' (same as C++ readLineFromSocket).
    buf = bytearray()
    while True:
        chunk = sock.recv(1)
        if not chunk:
            return None  # Server closed the connection.
        if chunk == b"\n":
            if buf and buf[-1] == ord("\r"):
                buf.pop()  # Handle "\r\n" from some clients.
            return buf.decode("utf-8")
        buf.extend(chunk)


def read_response(sock: socket.socket, idle_timeout_s: float = _DEFAULT_IDLE_TIMEOUT_S) -> str:
    # One command can get several lines back (e.g. help prints 3 lines).
    # Read lines until nothing new arrives for a short moment.
    lines: list[str] = []
    original_timeout = sock.gettimeout()

    try:
        sock.settimeout(None)  # Wait as long as needed for the first line.
        while True:
            line = read_line(sock)
            if line is None:
                break
            lines.append(line)

            # Check if another line is already waiting (don't block forever).
            sock.settimeout(idle_timeout_s)
            try:
                peek = sock.recv(1, socket.MSG_PEEK)
            except socket.timeout:
                break  # No more data right now — reply is complete.
            except OSError:
                break
            if not peek:
                break
            sock.settimeout(None)
    finally:
        sock.settimeout(original_timeout)

    if not lines:
        return ""
    return "\n".join(lines) + "\n"
