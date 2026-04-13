import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path



class MCRCError(Exception):
    pass


@dataclass
class MCRCFile:
    raw_header: str
    kind: str
    key: str
    reversed_key: str
    ascii_sequence: list[int]
    raw_body: str
    footer: str
    decoded_text: str


class MCRCParser:
    FOOTER = "MCRCfileMCRCend"

    HEADER_RE = re.compile(
        r"^MCRCfileMCRCskegmen type\(MCRC (?P<kind>Text|Encrypted text)\)"
        r"⌘ (?P<key>[A-Za-z0-9]+)⇄(?P<reversed>[A-Za-z0-9]+) "
        r"(?P=key)→(?P<ascii>\d+(?: \d+)*)$"
    )

    UNICODE_TOKEN_RE = re.compile(r"U\+([0-9A-Fa-f]{4,6})")
    MORSE_ONLY_RE = re.compile(r"^[.\-/ ]+$")

    MORSE_TO_DIGIT = {
        "-----": "0",
        ".----": "1",
        "..---": "2",
        "...--": "3",
        "....-": "4",
        ".....": "5",
        "-....": "6",
        "--...": "7",
        "---..": "8",
        "----.": "9",
    }
    DIGIT_TO_MORSE = {v: k for k, v in MORSE_TO_DIGIT.items()}

    def parse_file(self, path: str | Path) -> MCRCFile:
        text = Path(path).read_text(encoding="utf-8")
        return self.parse_text(text)

    def parse_text(self, text: str) -> MCRCFile:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if len(lines) < 3:
            raise MCRCError("MCRC files must contain at least a header, a body and a footer.")

        header = lines[0]
        footer = lines[-1]
        body = "\n".join(lines[1:-1])

        if footer != self.FOOTER:
            raise MCRCError(f"Invalid footer. Expected '{self.FOOTER}'.")

        match = self.HEADER_RE.match(header)
        if not match:
            raise MCRCError("Invalid MCRC header format.")

        kind = match.group("kind")
        key = match.group("key")
        reversed_key = match.group("reversed")
        ascii_sequence = [int(x) for x in match.group("ascii").split()]

        self._validate_key_data(key, reversed_key, ascii_sequence)

        if kind == "Text":
            decoded = self._decode_unicode_body(body)
        elif kind == "Encrypted text":
            decoded = self._decode_encrypted_body(body)
        else:
            raise MCRCError(f"Unsupported MCRC type: {kind}")

        return MCRCFile(
            raw_header=header,
            kind=kind,
            key=key,
            reversed_key=reversed_key,
            ascii_sequence=ascii_sequence,
            raw_body=body,
            footer=footer,
            decoded_text=decoded,
        )

    def build_text_file(self, plain_text: str, key: str = "MeowCatsRCute", noencode: bool = False) -> str:
        header = self._make_header("Text", key)
        if not noencode:
            body = " ".join(f"U+{ord(ch):04X}" for ch in plain_text)
        else:
            body = plain_text
        return f"{header}\n{body}\n{self.FOOTER}\n"

    def build_encrypted_file(self, plain_text: str, key: str = "MeowCatsRCute") -> str:
        header = self._make_header("Encrypted text", key)
        body = self._encode_encrypted_body(plain_text)
        return f"{header}\n{body}\n{self.FOOTER}\n"

    def _make_header(self, kind: str, key: str) -> str:
        reversed_key = key[::-1]
        ascii_sequence = " ".join(str(ord(ch)) for ch in key)
        return (
            f"MCRCfileMCRCskegmen type(MCRC {kind})⌘ "
            f"{key}⇄{reversed_key} {key}→{ascii_sequence}"
        )

    def _validate_key_data(self, key: str, reversed_key: str, ascii_sequence: list[int]) -> None:
        expected_reverse = key[::-1]
        if reversed_key != expected_reverse:
            raise MCRCError(
                f"Reverse-key mismatch. Expected '{expected_reverse}', got '{reversed_key}'."
            )

        expected_ascii = [ord(ch) for ch in key]
        if ascii_sequence != expected_ascii:
            raise MCRCError(
                f"ASCII sequence mismatch. Expected {expected_ascii}, got {ascii_sequence}."
            )

    def _decode_unicode_body(self, body: str) -> str:
        tokens = body.split()
        if not tokens:
            raise MCRCError("Empty Unicode body.")

        chars = []
        for token in tokens:
            match = self.UNICODE_TOKEN_RE.fullmatch(token)
            if not match:
                raise MCRCError(f"Invalid Unicode token: {token}")
            chars.append(chr(int(match.group(1), 16)))
        return "".join(chars)

    def _decode_encrypted_body(self, body: str) -> str:
        body = body.strip()
        if not body:
            raise MCRCError("Empty encrypted body.")
        if not self.MORSE_ONLY_RE.fullmatch(body):
            raise MCRCError("Encrypted body contains invalid characters.")

        # morse -> binary stage tokens
        binary_chunks = self._morse_to_sixbit_chunks(body)

        # binary -> ASCII decimal codes text
        ascii_decimal_text = "".join(chr(int(bits, 2)) for bits in binary_chunks)

        # ASCII decimal codes -> octal text
        octal_text = self._ascii_decimal_codes_to_text(ascii_decimal_text)

        # octal text -> hex text
        hex_text = self._octal_text_to_text(octal_text)

        # hex -> plain text
        try:
            return bytes.fromhex(hex_text).decode("utf-8")
        except ValueError as e:
            raise MCRCError("Failed to decode hex stage into plain text.") from e

    def _encode_encrypted_body(self, plain_text: str) -> str:
        # plain -> hex
        hex_text = plain_text.encode("utf-8").hex()

        # hex -> octal ASCII codes
        octal_text = " ".join(f"{ord(ch):o}" for ch in hex_text)

        # octal -> ASCII decimal codes
        ascii_decimal_text = " ".join(str(ord(ch)) for ch in octal_text)

        # ASCII decimal codes -> 6-bit binary chunks from each char
        binary_chunks = [format(ord(ch), "06b") for ch in ascii_decimal_text]

        # binary chunks rendered as decimal digits, then each digit to morse
        morse_groups = []
        for bits in binary_chunks:
            decimal_render = str(int(bits, 2))
            morse_digits = [self.DIGIT_TO_MORSE[d] for d in decimal_render]
            morse_groups.append(" ".join(morse_digits))

        return " / ".join(morse_groups)

    def _morse_to_sixbit_chunks(self, body: str) -> list[str]:
        groups = [group.strip() for group in body.split("/") if group.strip()]
        result = []

        for group in groups:
            digits = []
            for token in group.split():
                if token not in self.MORSE_TO_DIGIT:
                    raise MCRCError(f"Invalid Morse token: {token}")
                digits.append(self.MORSE_TO_DIGIT[token])

            decimal_string = "".join(digits)
            value = int(decimal_string, 10)
            bits = format(value, "b")
            if len(bits) > 6:
                raise MCRCError(f"Morse group expands beyond 6 bits: {decimal_string}")
            result.append(bits.zfill(6))

        return result

    def _ascii_decimal_codes_to_text(self, text: str) -> str:
        text = text.strip()
        if not text:
            raise MCRCError("ASCII decimal stage is empty.")

        try:
            return "".join(chr(int(part)) for part in text.split())
        except ValueError as e:
            raise MCRCError("Invalid ASCII decimal code sequence.") from e

    def _octal_text_to_text(self, text: str) -> str:
        text = text.strip()
        if not text:
            raise MCRCError("Octal stage is empty.")

        try:
            return "".join(chr(int(part, 8)) for part in text.split())
        except ValueError as e:
            raise MCRCError("Invalid octal sequence.") from e


def cmd_decode(args: argparse.Namespace) -> int:
    parser = MCRCParser()
    mcrc = parser.parse_file(args.input)

    if args.json:
        print(json.dumps(asdict(mcrc), ensure_ascii=False, indent=2))
    if args.output:
        output = parser.build_text_file(mcrc.decoded_text, key="MeowCatsRCute", noencode=True)
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        print(mcrc.decoded_text)

    return 0


def cmd_inspect(args: argparse.Namespace) -> int:
    parser = MCRCParser()
    mcrc = parser.parse_file(args.input)

    data = {
        "kind": mcrc.kind,
        "key": mcrc.key,
        "reversed_key": mcrc.reversed_key,
        "ascii_sequence": mcrc.ascii_sequence,
        "footer": mcrc.footer,
        "body_preview": mcrc.raw_body[:160] + ("..." if len(mcrc.raw_body) > 160 else ""),
        "decoded_preview": mcrc.decoded_text[:160] + ("..." if len(mcrc.decoded_text) > 160 else ""),
    }
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return 0


def cmd_encode_text(args: argparse.Namespace) -> int:
    parser = MCRCParser()
    output = parser.build_text_file(args.text, key=args.key)

    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        sys.stdout.write(output)
    return 0


def cmd_encode_encrypted(args: argparse.Namespace) -> int:
    parser = MCRCParser()
    output = parser.build_encrypted_file(args.text, key=args.key)

    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        sys.stdout.write(output)
    return 0


def build_cli() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(
        prog="mcrc",
        description="CLI for reading and writing .mcrc files.",
    )
    sub = ap.add_subparsers(dest="command", required=True)

    decode = sub.add_parser("decode", help="Decode an .mcrc file to plain text.")
    decode.add_argument("input", help="Path to .mcrc file")
    decode.add_argument("-o", "--output", help="Write decoded text to file")
    decode.add_argument("--json", action="store_true", help="Print full parsed structure as JSON")
    decode.set_defaults(func=cmd_decode)

    inspect_cmd = sub.add_parser("inspect", help="Inspect header/body metadata from an .mcrc file.")
    inspect_cmd.add_argument("input", help="Path to .mcrc file")
    inspect_cmd.set_defaults(func=cmd_inspect)

    enc_text = sub.add_parser("encode-text", help="Create an MCRC Text file from plain text.")
    enc_text.add_argument("text", help="Plain text to encode")
    enc_text.add_argument("-o", "--output", help="Write output to file")
    enc_text.add_argument("--key", default="MeowCatsRCute", help="Header key")
    enc_text.set_defaults(func=cmd_encode_text)

    enc_enc = sub.add_parser(
        "encode-encrypted",
        help="Create an MCRC Encrypted text file from plain text.",
    )
    enc_enc.add_argument("text", help="Plain text to encode")
    enc_enc.add_argument("-o", "--output", help="Write output to file")
    enc_enc.add_argument("--key", default="MeowCatsRCute", help="Header key")
    enc_enc.set_defaults(func=cmd_encode_encrypted)

    return ap


def main() -> int:
    cli = build_cli()
    args = cli.parse_args()

    try:
        return args.func(args)
    except MCRCError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    except FileNotFoundError as e:
        print(f"Error: file not found: {e.filename}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())