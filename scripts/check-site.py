"""Offline structural checks for this static site; no server or network calls."""
from __future__ import annotations

import base64
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, source: str):
        super().__init__()
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.resources: list[str] = []
        self.csp = ""
        self.scripts: list[str] = []
        self.inline: list[str] | None = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
        if "src" in attrs:
            self.resources.append(attrs["src"])
        if tag == "link" and "href" in attrs:
            self.resources.append(attrs["href"])
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "content-security-policy":
            self.csp = attrs.get("content", "")
        if tag == "script" and "src" not in attrs:
            self.inline = []

    def handle_data(self, data):
        if self.inline is not None:
            self.inline.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.inline is not None:
            self.scripts.append("".join(self.inline))
            self.inline = None


def main():
    documents = {p: Document(p.read_text(encoding="utf8")) for p in ROOT.glob("*.html")}
    checked = 0
    for page, document in documents.items():
        if not document.csp:
            raise ValueError(f"{page.name}: missing CSP")
        for resource in document.resources:
            if urlsplit(resource).scheme or resource.startswith("//"):
                raise ValueError(f"{page.name}: external resource is outside the offline site")
        for link in document.links + document.resources:
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc:
                continue  # external links are not contacted or validated
            target = (page.parent / unquote(parsed.path)).resolve() if parsed.path else page
            if not target.is_relative_to(ROOT) or not target.is_file():
                raise ValueError(f"{page.name}: missing/out-of-root local target {link}")
            if parsed.fragment and target.suffix == ".html":
                if target not in documents or unquote(parsed.fragment) not in documents[target].ids:
                    raise ValueError(f"{page.name}: missing fragment {link}")
            checked += 1
        directives = dict((parts[0], parts[1:]) for part in document.csp.split(";") if (parts := part.split()))
        for script in document.scripts:
            digest = base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
            if f"'sha256-{digest}'" not in directives.get("script-src", []):
                raise ValueError(f"{page.name}: inline script is not covered by its CSP hash")
    json_files = list((ROOT / "assets").glob("*.json"))
    for file in json_files:
        json.loads(file.read_text(encoding="utf8"))
    print(f"Checked {len(documents)} HTML files, {checked} local references, {len(json_files)} JSON assets and inline-script CSP hashes")


if __name__ == "__main__":
    main()
